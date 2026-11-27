'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var kit12 = require('./kit-12-B4H_NaC_.cjs');
var partsKit12 = require('./parts-kit-12-CKE_UdA5.cjs');

/** The level (0–4) of `value` on a scale up to `max`: 0 only for zero, then four equal bands. */
function heatLevel(value, max) {
    if (!(value > 0) || !(max > 0))
        return 0;
    return Math.min(4, Math.max(1, Math.ceil((value / max) * 4)));
}
function defineHeatmap(tag = 'usa-heatmap') {
    const ctor = base.defineElement(tag, Base => class Heatmap extends Base {
        constructor() {
            super(...arguments);
            this._data = null;
        }
        static get observedAttributes() { return ['values', 'start', 'label', 'unit', 'colors']; }
        get data() { return this._data ?? kit12.numbers(this.str('values'), 1500); }
        set data(v) { this._data = Array.isArray(v) ? v.slice(0, 1500).map((n) => (Number.isFinite(+n) && +n > 0 ? +n : 0)) : null; this.changed('values'); }
        mount() {
            const data = this.data;
            const unit = this.str('unit', 'contributions');
            const start = /^\d{4}-\d{2}-\d{2}$/.test(this.str('start')) ? new Date(`${this.str('start')}T12:00:00`) : null;
            const dayName = (i) => {
                if (!start || Number.isNaN(start.getTime()))
                    return `#${i + 1}`;
                const d = new Date(start.getTime() + i * 864e5);
                try {
                    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                }
                catch {
                    return d.toDateString();
                }
            };
            const max = Math.max(0, ...data);
            const cols = Math.max(1, Math.ceil(data.length / 7));
            const root = moments.make('div', 'usa-kit usa-heat');
            const grid = moments.make('div', 'usa-heat-grid');
            grid.setAttribute('role', 'grid');
            grid.setAttribute('aria-label', this.str('label', 'Activity'));
            grid.style.setProperty('--cols', String(cols));
            const colors = kit.list(this.str('colors'), 5).map(kit.cleanColor);
            colors.forEach((c, i) => { if (c)
                root.style.setProperty(`--heat-${i}`, c); });
            const cells = [];
            for (let r = 0; r < 7; r++) {
                const row = moments.make('div', 'usa-heat-row');
                row.setAttribute('role', 'row');
                for (let c = 0; c < cols; c++) {
                    const i = c * 7 + r;
                    const cell = moments.make('span', 'usa-heat-cell');
                    cell.setAttribute('role', 'gridcell');
                    if (i < data.length) {
                        cell.dataset.level = String(heatLevel(data[i], max));
                        cell.setAttribute('aria-label', `${dayName(i)}: ${data[i]} ${unit}`);
                        cell.style.setProperty('--d', String(c + r));
                        cell.tabIndex = -1;
                    }
                    else
                        cell.setAttribute('aria-hidden', 'true'), (cell.dataset.empty = '');
                    cells[i] = cell;
                    row.append(cell);
                }
                grid.append(row);
            }
            const tip = moments.make('div', 'usa-heat-tip');
            tip.setAttribute('aria-hidden', 'true');
            root.append(grid, tip);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            let at = Math.max(0, data.length - 1);
            const show = (cell) => {
                if (!cell || cell.dataset.empty !== undefined) {
                    tip.removeAttribute('data-show');
                    return;
                }
                tip.textContent = cell.getAttribute('aria-label');
                tip.style.setProperty('--x', `${cell.offsetLeft + cell.offsetWidth / 2}px`);
                tip.style.setProperty('--y', `${cell.offsetTop}px`);
                tip.setAttribute('data-show', '');
            };
            const focusCell = (i, move = true) => {
                if (!data.length)
                    return;
                at = Math.min(data.length - 1, Math.max(0, i));
                cells.forEach((c, j) => { if (j < data.length)
                    c.tabIndex = j === at ? 0 : -1; });
                if (move)
                    cells[at].focus();
            };
            focusCell(at, false);
            this.listen(grid, 'keydown', (e) => {
                const i = cells.indexOf(e.target);
                if (i < 0)
                    return;
                const r = i % 7;
                const to = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : e.key === 'ArrowRight' ? i + 7 : e.key === 'ArrowLeft' ? i - 7
                    : e.key === 'Home' ? i - r : e.key === 'End' ? i - r + 6 : NaN;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.emit('select', { index: i, value: data[i] });
                    return;
                }
                if (Number.isNaN(to))
                    return;
                e.preventDefault();
                if (to >= 0 && to < data.length)
                    focusCell(to);
            });
            this.listen(grid, 'focusin', (e) => show(e.target));
            this.listen(grid, 'focusout', () => tip.removeAttribute('data-show'));
            this.listen(grid, 'pointerover', (e) => show(e.target.closest('.usa-heat-cell')));
            this.listen(grid, 'pointerleave', () => tip.removeAttribute('data-show'));
            this.listen(grid, 'click', (e) => {
                const i = cells.indexOf(e.target.closest('.usa-heat-cell'));
                if (i < 0 || i >= data.length)
                    return;
                focusCell(i);
                this.emit('select', { index: i, value: data[i] });
            });
            let shown = false;
            this.inView((v) => { if (v && !shown) {
                shown = true;
                root.setAttribute('data-in', '');
            } });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'parts-kit-12', text: partsKit12.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineHeatmap = defineHeatmap;
exports.heatLevel = heatLevel;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/chunks/heatmap-CkBFS5Lo.cjs.map