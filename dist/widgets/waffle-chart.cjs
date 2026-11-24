'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var kit = require('../chunks/kit-CujTUbPK.cjs');
var kit12 = require('../chunks/kit-12-B4H_NaC_.cjs');
var kit13 = require('../chunks/kit-13-CsarW7Cz.cjs');
var partsKit13 = require('../chunks/parts-kit-13-BzwC3E_M.cjs');

const PALETTE = ['#4f46e5', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6'];
function defineWaffleChart(tag = 'usa-waffle-chart') {
    const ctor = base.defineElement(tag, Base => class WaffleChart extends Base {
        static get observedAttributes() { return ['values', 'labels', 'colors', 'label', 'total', 'shape']; }
        mount() {
            const values = kit12.numbers(this.str('values'), 8);
            const labels = kit.list(this.str('labels'), 8);
            const colors = kit.list(this.str('colors'), 8).map(kit.cleanColor);
            const sum = values.reduce((a, b) => a + b, 0);
            const total = Math.max(this.num('total', sum > 100 ? sum : 100), sum) || 100;
            const cells = kit13.waffleCells(values, total, 100);
            const color = (i) => colors[i] || PALETTE[i % PALETTE.length];
            const root = moments.make('figure', 'usa-kit usa-waffle');
            root.setAttribute('aria-label', this.str('label', 'Chart'));
            root.toggleAttribute('data-round', this.str('shape') === 'round');
            root.toggleAttribute('data-static', this.reduced);
            const grid = moments.make('div', 'usa-waffle-grid');
            grid.setAttribute('aria-hidden', 'true');
            const squares = cells.map((c, k) => {
                const s = moments.make('i', 'usa-waffle-cell');
                const col = Math.floor(k / 10), row = 9 - (k % 10);
                s.style.gridColumn = String(col + 1);
                s.style.gridRow = String(row + 1);
                s.style.setProperty('--d', String(col + (9 - row)));
                if (c >= 0) {
                    s.style.setProperty('--c', color(c));
                    s.dataset.k = String(c);
                }
                grid.append(s);
                return s;
            });
            const legend = moments.make('ul', 'usa-waffle-legend');
            const keys = values.map((v, i) => {
                const li = moments.make('li');
                const b = moments.make('button', 'usa-waffle-key');
                b.type = 'button';
                b.style.setProperty('--c', color(i));
                const n = cells.filter((c) => c === i).length;
                b.append(moments.make('span', 'usa-waffle-dot'), moments.make('span', 'usa-waffle-name', labels[i] || `#${i + 1}`), moments.make('span', 'usa-waffle-val', `${kit.formatNumber((v / total) * 100, 1)}%`));
                this.listen(b, 'click', () => this.emit('select', { index: i, value: v, cells: n }));
                li.append(b);
                legend.append(li);
                return b;
            });
            const pick = (i) => {
                root.toggleAttribute('data-picking', i !== null);
                for (const s of squares)
                    s.toggleAttribute('data-on', i !== null && s.dataset.k === String(i));
                keys.forEach((b, j) => b.toggleAttribute('data-on', j === i));
            };
            keys.forEach((b, i) => {
                this.listen(b, 'pointerenter', () => pick(i));
                this.listen(b, 'focus', () => pick(i));
                this.listen(b, 'pointerleave', () => pick(null));
                this.listen(b, 'blur', () => pick(null));
            });
            root.append(grid, legend);
            this.append(root);
            let shown = false;
            this.inView((v) => { if (v && !shown) {
                shown = true;
                root.setAttribute('data-in', '');
            } });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'parts-kit-13', text: partsKit13.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineWaffleChart = defineWaffleChart;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/waffle-chart.cjs.map