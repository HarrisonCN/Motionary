import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make, uniqueId } from './moments';
import { flip, measure } from './kit';
import css from './data-media.css?raw';

export type SortDirection = 'ascending' | 'descending' | 'none';

/** A cell's sort key: its `data-value`, else its text; numbers (incl. 1,234.5 / 12% / $9) compare as numbers. */
export function sortKey(cell: Element | undefined): string | number {
  if (!cell) return '';
  const raw = (cell.getAttribute('data-value') ?? cell.textContent ?? '').trim();
  const n = Number(raw.replace(/[,\s%$€£¥]/g, ''));
  return raw !== '' && Number.isFinite(n) ? n : raw.toLowerCase();
}

/** Compare two sort keys (numbers before text). */
export function compareKeys(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'number') return -1;
  if (typeof b === 'number') return 1;
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Progressive enhancement for the `<table>` inside it: header buttons sort by a column (`aria-sort` on the header,
 * numbers compared as numbers), an optional search box filters rows, and the rows glide to their new places
 * (FLIP) instead of jumping. A polite status line reads "12 of 40 rows". The table stays a real table; without
 * JavaScript it is simply unsorted. Columns marked `data-sort="false"` on their `<th>` are left alone.
 *
 * Attributes: `filterable` (adds the search box), `filter-label` (Filter rows), `placeholder` (Filter…),
 * `sort-column` (0-based), `sort-direction` (ascending | descending).
 * Methods `sort(column, direction?)`, `filter(query)`. Events `usa:sort` ({ column, direction }),
 * `usa:filter` ({ query, count }).
 */
export interface UsaDataTableElement extends UsaElement {
  sort(column: number, direction?: SortDirection): void;
  filter(query: string): number;
}

export function defineDataTable(tag = 'usa-data-table'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class DataTable extends Base {
    static get observedAttributes(): string[] { return ['filterable', 'filter-label', 'placeholder', 'sort-column', 'sort-direction']; }
    private _sort?: (c: number, d?: SortDirection) => void;
    private _filter?: (q: string) => number;
    sort(column: number, direction?: SortDirection): void { this._sort?.(column, direction); }
    filter(query: string): number { return this._filter?.(query) ?? 0; }
    mount(): void {
      const table = this.querySelector('table');
      if (!table) return;
      const body = table.tBodies[0];
      const head = table.tHead?.rows[0] || table.rows[0];
      if (!body || !head) return;
      const rows = Array.from(body.rows);
      const originalOrder = rows.slice();
      const root = make('div', 'usa-kit usa-dt');
      const tools = make('div', 'usa-dt-tools');
      const status = make('p', 'usa-dt-status');
      status.setAttribute('aria-live', 'polite');
      let input: HTMLInputElement | null = null;
      if (this.flag('filterable')) {
        const label = make('label', 'usa-dt-search');
        const id = uniqueId('usa-dt-q');
        const text = make('span', 'usa-sr', this.str('filter-label', 'Filter rows'));
        input = make('input', 'usa-dt-input');
        input.type = 'search';
        input.id = id;
        input.placeholder = this.str('placeholder', 'Filter…');
        input.autocomplete = 'off';
        label.htmlFor = id;
        label.append(text, input);
        tools.append(label);
      }
      tools.append(status);
      const scroller = make('div', 'usa-dt-scroll');
      table.parentNode!.insertBefore(root, table);
      scroller.append(table);
      root.append(tools, scroller);
      table.classList.add('usa-dt-table');
      const headers = Array.from(head.cells);
      const buttons = headers.map((th, i) => {
        if (th.dataset.sort === 'false') return null;
        const b = make('button', 'usa-dt-sort');
        b.type = 'button';
        const label = make('span', 'usa-dt-label');
        label.append(...Array.from(th.childNodes));
        const arrow = make('span', 'usa-dt-arrow');
        arrow.setAttribute('aria-hidden', 'true');
        b.append(label, arrow);
        th.append(b);
        th.setAttribute('aria-sort', 'none');
        this.listen(b, 'click', () => {
          const cur = th.getAttribute('aria-sort');
          this._sort?.(i, cur === 'ascending' ? 'descending' : cur === 'descending' ? 'none' : 'ascending');
        });
        return b;
      });
      const report = () => {
        const shown = rows.filter((r) => !r.hidden).length;
        status.textContent = `${shown} of ${rows.length} rows`;
        return shown;
      };
      const reorder = (order: HTMLTableRowElement[]) => {
        const before = measure(rows.filter((r) => !r.hidden));
        for (const r of order) body.append(r);
        if (!this.reduced) flip(before, rows, 380);
      };
      this._sort = (column, direction) => {
        const th = headers[column];
        if (!th || !buttons[column]) return;
        const dir: SortDirection = direction === 'descending' || direction === 'none' ? direction : 'ascending';
        headers.forEach((h, i) => buttons[i] && h.setAttribute('aria-sort', i === column ? dir : 'none'));
        const order = dir === 'none' ? originalOrder.slice() : rows.slice().sort((a, b) => {
          const c = compareKeys(sortKey(a.cells[column]), sortKey(b.cells[column]));
          return dir === 'ascending' ? c : -c;
        });
        reorder(order);
        this.emit('sort', { column, direction: dir });
      };
      this._filter = (q) => {
        const query = String(q ?? '').trim().toLowerCase();
        if (input && input.value !== q) input.value = String(q ?? '');
        const before = measure(rows.filter((r) => !r.hidden));
        for (const r of rows) r.hidden = !!query && !(r.textContent || '').toLowerCase().includes(query);
        if (!this.reduced) flip(before, rows, 320);
        return report();
      };
      if (input) {
        let t = 0;
        this.listen(input, 'input', () => {
          clearTimeout(t);
          t = window.setTimeout(() => this.emit('filter', { query: input!.value, count: this._filter!(input!.value) }), 120);
        });
        this.onCleanup(() => clearTimeout(t));
      }
      report();
      const sc = this.num('sort-column', -1);
      if (sc >= 0) this._sort(sc, this.str('sort-direction') === 'descending' ? 'descending' : 'ascending');
      this.onCleanup(() => {
        for (const r of originalOrder) { body.append(r); r.hidden = false; }
        headers.forEach((th, i) => {
          const b = buttons[i];
          if (!b) return;
          th.removeAttribute('aria-sort');
          th.append(...Array.from(b.firstElementChild!.childNodes));
          b.remove();
        });
        table.classList.remove('usa-dt-table');
        root.parentNode!.insertBefore(table, root);
        root.remove();
        this._sort = this._filter = undefined;
      });
    }
  }, { id: 'data-media', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
