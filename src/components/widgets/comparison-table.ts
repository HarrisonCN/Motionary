import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import { cellMark, rowDiffers } from './kit-15';
import css from './ui-kit-15.css?raw';

/**
 * Turns a plain HTML comparison table (plans, products, versions) into an easier one to read. Cells that say yes or no
 * ("yes", "✓", "是" … / "no", "—", "否" …) get a green check or a grey cross, the words staying for screen readers; one
 * column can be highlighted with a badge such as "Popular"; the first column sticks while the table scrolls sideways;
 * and an "Only differences" switch hides the rows where every column says the same. The table itself is the content
 * and is put back unchanged when the element is removed.
 *
 * Attributes: `highlight` (the column to highlight, counting the compared columns from 1), `badge-label` (Popular),
 * `diff-label` (Only differences), `differences` (start with only the differences shown), `label`.
 * Event `usa:filter` ({ differences, hidden }).
 */
export interface UsaComparisonTableElement extends UsaElement {
  readonly differences: boolean;
}

export function defineComparisonTable(tag = 'usa-comparison-table'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class ComparisonTable extends Base {
    static get observedAttributes(): string[] { return ['highlight', 'badge-label', 'diff-label', 'differences', 'label']; }
    private _diff = false;
    get differences(): boolean { return this._diff; }
    mount(): void {
      const table = this.querySelector<HTMLTableElement>(':scope > table');
      if (!table) return;
      const root = make('div', 'usa-kit usa-ctable');
      root.toggleAttribute('data-static', this.reduced);
      const bar = make('div', 'usa-ctable-bar');
      const toggle = make('button', 'usa-ctable-diff');
      toggle.type = 'button';
      toggle.append(make('span', 'usa-ctable-switch'), make('span', '', this.str('diff-label', 'Only differences')));
      bar.append(toggle);
      const scroller = make('div', 'usa-ctable-scroll');
      scroller.tabIndex = 0;
      scroller.setAttribute('role', 'region');
      scroller.setAttribute('aria-label', this.str('label') || table.caption?.textContent?.trim() || 'Comparison');
      table.before(root);
      scroller.append(table);
      root.append(bar, scroller);
      table.classList.add('usa-ctable-table');
      const undo: (() => void)[] = [];
      // yes / no cells
      for (const cell of Array.from(table.querySelectorAll<HTMLTableCellElement>('tbody td'))) {
        const mark = cellMark(cell.textContent || '');
        if (!mark || cell.children.length) continue;
        const text = cell.textContent || '';
        const icon = make('span', 'usa-ctable-mark', mark === 'yes' ? '✓' : '✕');
        icon.setAttribute('aria-hidden', 'true');
        const sr = make('span', 'usa-kit-sr', text.trim());
        cell.dataset.mark = mark;
        cell.replaceChildren(icon, sr);
        undo.push(() => { cell.textContent = text; delete cell.dataset.mark; });
      }
      // the highlighted column
      const col = Math.round(this.num('highlight', 0));
      if (col > 0) {
        for (const tr of Array.from(table.rows)) {
          const cell = tr.cells[col];
          if (!cell) continue;
          cell.dataset.highlight = '';
          undo.push(() => delete cell.dataset.highlight);
        }
        const head = table.tHead?.rows[0]?.cells[col] || table.rows[0]?.cells[col];
        if (head) {
          const badge = make('span', 'usa-ctable-badge', this.str('badge-label', 'Popular'));
          head.append(badge);
          undo.push(() => badge.remove());
        }
      }
      const body = Array.from(table.tBodies).flatMap((b) => Array.from(b.rows));
      const same = body.filter((tr) => tr.cells.length > 2 && !rowDiffers(Array.from(tr.cells).map((c) => c.textContent || '')));
      const wasHidden = same.map((tr) => tr.hidden);
      const set = (on: boolean, tell: boolean) => {
        this._diff = on;
        toggle.setAttribute('aria-pressed', String(on));
        same.forEach((tr, i) => { tr.hidden = on || wasHidden[i]; });
        root.toggleAttribute('data-differences', on);
        if (tell) this.emit('filter', { differences: on, hidden: on ? same.length : 0 });
      };
      set(this.flag('differences'), false);
      toggle.disabled = !same.length;
      this.listen(toggle, 'click', () => set(!this._diff, true));
      this.onCleanup(() => {
        same.forEach((tr, i) => { tr.hidden = wasHidden[i]; });
        undo.reverse().forEach((f) => f());
        table.classList.remove('usa-ctable-table');
        if (!table.className) table.removeAttribute('class');
        root.replaceWith(table);
        this._diff = false;
      });
    }
  }, { id: 'ui-kit-15', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
