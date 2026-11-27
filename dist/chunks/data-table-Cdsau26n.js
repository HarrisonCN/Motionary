import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make, u as uniqueId } from './moments-Cg_NlOYG.js';
import { m as measure, f as flip } from './kit-DugHPVcq.js';
import { c as css } from './data-media-Dlw8-L0c.js';

/** A cell's sort key: its `data-value`, else its text; numbers (incl. 1,234.5 / 12% / $9) compare as numbers. */
function sortKey(cell) {
    if (!cell)
        return '';
    const raw = (cell.getAttribute('data-value') ?? cell.textContent ?? '').trim();
    const n = Number(raw.replace(/[,\s%$€£¥]/g, ''));
    return raw !== '' && Number.isFinite(n) ? n : raw.toLowerCase();
}
/** Compare two sort keys (numbers before text). */
function compareKeys(a, b) {
    if (typeof a === 'number' && typeof b === 'number')
        return a - b;
    if (typeof a === 'number')
        return -1;
    if (typeof b === 'number')
        return 1;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}
function defineDataTable(tag = 'usa-data-table') {
    const ctor = defineElement(tag, Base => class DataTable extends Base {
        static get observedAttributes() { return ['filterable', 'filter-label', 'placeholder', 'sort-column', 'sort-direction']; }
        sort(column, direction) { this._sort?.(column, direction); }
        filter(query) { return this._filter?.(query) ?? 0; }
        mount() {
            const table = this.querySelector('table');
            if (!table)
                return;
            const body = table.tBodies[0];
            const head = table.tHead?.rows[0] || table.rows[0];
            if (!body || !head)
                return;
            const rows = Array.from(body.rows);
            const originalOrder = rows.slice();
            const root = make('div', 'usa-kit usa-dt');
            const tools = make('div', 'usa-dt-tools');
            const status = make('p', 'usa-dt-status');
            status.setAttribute('aria-live', 'polite');
            let input = null;
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
            table.parentNode.insertBefore(root, table);
            scroller.append(table);
            root.append(tools, scroller);
            table.classList.add('usa-dt-table');
            const headers = Array.from(head.cells);
            const buttons = headers.map((th, i) => {
                if (th.dataset.sort === 'false')
                    return null;
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
            const reorder = (order) => {
                const before = measure(rows.filter((r) => !r.hidden));
                for (const r of order)
                    body.append(r);
                if (!this.reduced)
                    flip(before, rows, 380);
            };
            this._sort = (column, direction) => {
                const th = headers[column];
                if (!th || !buttons[column])
                    return;
                const dir = direction === 'descending' || direction === 'none' ? direction : 'ascending';
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
                if (input && input.value !== q)
                    input.value = String(q ?? '');
                const before = measure(rows.filter((r) => !r.hidden));
                for (const r of rows)
                    r.hidden = !!query && !(r.textContent || '').toLowerCase().includes(query);
                if (!this.reduced)
                    flip(before, rows, 320);
                return report();
            };
            if (input) {
                let t = 0;
                this.listen(input, 'input', () => {
                    clearTimeout(t);
                    t = window.setTimeout(() => this.emit('filter', { query: input.value, count: this._filter(input.value) }), 120);
                });
                this.onCleanup(() => clearTimeout(t));
            }
            report();
            const sc = this.num('sort-column', -1);
            if (sc >= 0)
                this._sort(sc, this.str('sort-direction') === 'descending' ? 'descending' : 'ascending');
            this.onCleanup(() => {
                for (const r of originalOrder) {
                    body.append(r);
                    r.hidden = false;
                }
                headers.forEach((th, i) => {
                    const b = buttons[i];
                    if (!b)
                        return;
                    th.removeAttribute('aria-sort');
                    th.append(...Array.from(b.firstElementChild.childNodes));
                    b.remove();
                });
                table.classList.remove('usa-dt-table');
                root.parentNode.insertBefore(table, root);
                root.remove();
                this._sort = this._filter = undefined;
            });
        }
    }, { id: 'data-media', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { compareKeys as c, defineDataTable as d, sortKey as s };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/data-table-Cdsau26n.js.map