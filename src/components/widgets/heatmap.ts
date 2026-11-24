import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cleanColor, list } from './kit';
import { numbers } from './kit-12';
import css from './parts-kit-12.css?raw';

/** The level (0–4) of `value` on a scale up to `max`: 0 only for zero, then four equal bands. */
export function heatLevel(value: number, max: number): number {
  if (!(value > 0) || !(max > 0)) return 0;
  return Math.min(4, Math.max(1, Math.ceil((value / max) * 4)));
}

/**
 * An activity calendar: one small square per day, seven to a column, shaded in five steps from empty to busiest (like a
 * contribution graph). The squares fade in on a diagonal sweep when the calendar first scrolls into view. It is an ARIA
 * grid with one tab stop: arrow keys move day by day and week by week, Home / End go to the ends of a week, and each cell
 * reads "<date or day number>: <value> <unit>". Hover or focus shows the same text in a tooltip; Enter or a click emits
 * `usa:select`. Set the numbers with `values` (or the `data` property); `start` (YYYY-MM-DD) dates the first square.
 *
 * Attributes: `values` (comma-separated numbers), `start` (date of the first value), `label` (Activity), `unit`
 * (contributions), `colors` (five comma-separated colors, empty → busiest).
 * Event `usa:select` ({ index, value }).
 */
export interface UsaHeatmapElement extends UsaElement {
  data: number[];
}

export function defineHeatmap(tag = 'usa-heatmap'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class Heatmap extends Base {
    static get observedAttributes(): string[] { return ['values', 'start', 'label', 'unit', 'colors']; }
    private _data: number[] | null = null;
    get data(): number[] { return this._data ?? numbers(this.str('values'), 1500); }
    set data(v: number[]) { this._data = Array.isArray(v) ? v.slice(0, 1500).map((n) => (Number.isFinite(+n) && +n > 0 ? +n : 0)) : null; this.changed('values'); }
    mount(): void {
      const data = this.data;
      const unit = this.str('unit', 'contributions');
      const start = /^\d{4}-\d{2}-\d{2}$/.test(this.str('start')) ? new Date(`${this.str('start')}T12:00:00`) : null;
      const dayName = (i: number) => {
        if (!start || Number.isNaN(start.getTime())) return `#${i + 1}`;
        const d = new Date(start.getTime() + i * 864e5);
        try { return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch { return d.toDateString(); }
      };
      const max = Math.max(0, ...data);
      const cols = Math.max(1, Math.ceil(data.length / 7));
      const root = make('div', 'usa-kit usa-heat');
      const grid = make('div', 'usa-heat-grid');
      grid.setAttribute('role', 'grid');
      grid.setAttribute('aria-label', this.str('label', 'Activity'));
      grid.style.setProperty('--cols', String(cols));
      const colors = list(this.str('colors'), 5).map(cleanColor);
      colors.forEach((c, i) => { if (c) root.style.setProperty(`--heat-${i}`, c); });
      const cells: HTMLElement[] = [];
      for (let r = 0; r < 7; r++) {
        const row = make('div', 'usa-heat-row');
        row.setAttribute('role', 'row');
        for (let c = 0; c < cols; c++) {
          const i = c * 7 + r;
          const cell = make('span', 'usa-heat-cell');
          cell.setAttribute('role', 'gridcell');
          if (i < data.length) {
            cell.dataset.level = String(heatLevel(data[i], max));
            cell.setAttribute('aria-label', `${dayName(i)}: ${data[i]} ${unit}`);
            cell.style.setProperty('--d', String(c + r));
            cell.tabIndex = -1;
          } else cell.setAttribute('aria-hidden', 'true'), (cell.dataset.empty = '');
          cells[i] = cell;
          row.append(cell);
        }
        grid.append(row);
      }
      const tip = make('div', 'usa-heat-tip');
      tip.setAttribute('aria-hidden', 'true');
      root.append(grid, tip);
      root.toggleAttribute('data-static', this.reduced);
      this.append(root);
      let at = Math.max(0, data.length - 1);
      const show = (cell: HTMLElement | null) => {
        if (!cell || cell.dataset.empty !== undefined) { tip.removeAttribute('data-show'); return; }
        tip.textContent = cell.getAttribute('aria-label');
        tip.style.setProperty('--x', `${cell.offsetLeft + cell.offsetWidth / 2}px`);
        tip.style.setProperty('--y', `${cell.offsetTop}px`);
        tip.setAttribute('data-show', '');
      };
      const focusCell = (i: number, move = true) => {
        if (!data.length) return;
        at = Math.min(data.length - 1, Math.max(0, i));
        cells.forEach((c, j) => { if (j < data.length) c.tabIndex = j === at ? 0 : -1; });
        if (move) cells[at].focus();
      };
      focusCell(at, false);
      this.listen(grid, 'keydown', (e: KeyboardEvent) => {
        const i = cells.indexOf(e.target as HTMLElement);
        if (i < 0) return;
        const r = i % 7;
        const to = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowRight' ? i + 7 : e.key === 'ArrowLeft' ? i - 7
          : e.key === 'Home' ? i - r : e.key === 'End' ? i - r + 6 : NaN;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.emit('select', { index: i, value: data[i] }); return; }
        if (Number.isNaN(to)) return;
        e.preventDefault();
        if (to >= 0 && to < data.length) focusCell(to);
      });
      this.listen(grid, 'focusin', (e: FocusEvent) => show(e.target as HTMLElement));
      this.listen(grid, 'focusout', () => tip.removeAttribute('data-show'));
      this.listen(grid, 'pointerover', (e: PointerEvent) => show((e.target as Element).closest('.usa-heat-cell') as HTMLElement));
      this.listen(grid, 'pointerleave', () => tip.removeAttribute('data-show'));
      this.listen(grid, 'click', (e: MouseEvent) => {
        const i = cells.indexOf((e.target as Element).closest('.usa-heat-cell') as HTMLElement);
        if (i < 0 || i >= data.length) return;
        focusCell(i);
        this.emit('select', { index: i, value: data[i] });
      });
      let shown = false;
      this.inView((v) => { if (v && !shown) { shown = true; root.setAttribute('data-in', ''); } });
      this.onCleanup(() => root.remove());
    }
  }, { id: 'parts-kit-12', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
