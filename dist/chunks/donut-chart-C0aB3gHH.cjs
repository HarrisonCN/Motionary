'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var kit = require('./kit-CujTUbPK.cjs');
var kit12 = require('./kit-12-B4H_NaC_.cjs');
var partsKit12 = require('./parts-kit-12-CKE_UdA5.cjs');

const PALETTE = ['#6366f1', '#22d3ee', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#f97316', '#64748b'];
/** Where each slice starts and how long it is, as fractions of the ring (a 0.5% gap between slices when more than one). */
function donutArcs(values) {
    const vals = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));
    const total = vals.reduce((a, b) => a + b, 0);
    if (!total)
        return vals.map(() => ({ start: 0, length: 0 }));
    const gap = vals.filter(Boolean).length > 1 ? 0.005 : 0;
    let at = 0;
    return vals.map((v) => {
        const f = v / total;
        const out = { start: at, length: Math.max(0, f - (f ? gap : 0)) };
        at += f;
        return out;
    });
}
function defineDonutChart(tag = 'usa-donut-chart') {
    const ctor = base.defineElement(tag, Base => class DonutChart extends Base {
        constructor() {
            super(...arguments);
            this._data = null;
        }
        static get observedAttributes() { return ['values', 'labels', 'colors', 'label', 'unit', 'thickness', 'center-label']; }
        get data() { return this._data ?? kit12.numbers(this.str('values'), 24); }
        set data(v) { this._data = Array.isArray(v) ? v.slice(0, 24).map((n) => (Number.isFinite(+n) && +n > 0 ? +n : 0)) : null; this.changed('values'); }
        mount() {
            const data = this.data;
            const labels = kit.list(this.str('labels'), 24);
            const colors = kit.list(this.str('colors'), 24).map(kit.cleanColor);
            const unit = this.str('unit');
            const total = data.reduce((a, b) => a + b, 0);
            const arcs = donutArcs(data);
            const k = Math.min(0.9, Math.max(0.1, this.num('thickness', 0.38)));
            const R = 50, w = R * k, r = R - w / 2, C = 2 * Math.PI * r;
            const root = moments.make('figure', 'usa-kit usa-donut');
            root.setAttribute('aria-label', this.str('label', 'Chart'));
            const ns = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(ns, 'svg');
            svg.setAttribute('viewBox', '0 0 100 100');
            svg.setAttribute('aria-hidden', 'true');
            svg.classList.add('usa-donut-svg');
            const track = document.createElementNS(ns, 'circle');
            track.setAttribute('class', 'usa-donut-track');
            for (const [a, v] of [['cx', '50'], ['cy', '50'], ['r', String(r)], ['stroke-width', String(w)]])
                track.setAttribute(a, v);
            svg.append(track);
            const name = (i) => labels[i] || `#${i + 1}`;
            const fmt = (n) => `${kit.formatNumber(n, 1)}${unit ? ` ${unit}` : ''}`;
            const slices = arcs.map((a, i) => {
                const c = document.createElementNS(ns, 'circle');
                c.setAttribute('class', 'usa-donut-slice');
                for (const [k2, v] of [['cx', '50'], ['cy', '50'], ['r', String(r)], ['stroke-width', String(w)]])
                    c.setAttribute(k2, v);
                c.style.setProperty('--len', String(a.length * C));
                c.style.setProperty('--c', String(C));
                c.style.setProperty('--rot', `${a.start * 360 - 90}deg`);
                c.style.setProperty('--mid', `${(a.start + a.length / 2) * 360 - 90}deg`);
                c.style.setProperty('--i', String(i));
                c.style.stroke = colors[i] || PALETTE[i % PALETTE.length];
                svg.append(c);
                return c;
            });
            const mid = moments.make('div', 'usa-donut-mid');
            const big = moments.make('strong', 'usa-donut-big');
            const small = moments.make('span', 'usa-donut-small', this.str('center-label', 'Total'));
            mid.append(big, small);
            mid.setAttribute('aria-hidden', 'true');
            const ring = moments.make('div', 'usa-donut-ring');
            ring.append(svg, mid);
            const legend = moments.make('ul', 'usa-donut-legend');
            const keys = data.map((v, i) => {
                const li = moments.make('li');
                const b = moments.make('button', 'usa-donut-key');
                b.type = 'button';
                b.style.setProperty('--c', colors[i] || PALETTE[i % PALETTE.length]);
                const pct = total ? Math.round((v / total) * 1000) / 10 : 0;
                b.append(moments.make('span', 'usa-donut-dot'), moments.make('span', 'usa-donut-name', name(i)), moments.make('span', 'usa-donut-val', `${fmt(v)} · ${pct}%`));
                li.append(b);
                legend.append(li);
                return b;
            });
            root.append(ring, legend);
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            let stop = () => { };
            const showTotal = (from = total) => { stop(); stop = kit.tween(from, total, 900, (v) => { big.textContent = kit.formatNumber(v, Number.isInteger(total) ? 0 : 1); }, this); small.textContent = this.str('center-label', 'Total'); };
            big.textContent = kit.formatNumber(0);
            const pick = (i) => {
                slices.forEach((s, j) => s.toggleAttribute('data-on', j === i));
                keys.forEach((b, j) => b.toggleAttribute('data-on', j === i));
                root.toggleAttribute('data-picking', i !== null);
                if (i === null) {
                    showTotal();
                    return;
                }
                stop();
                big.textContent = kit.formatNumber(data[i], 1);
                small.textContent = name(i);
            };
            keys.forEach((b, i) => {
                this.listen(b, 'pointerenter', () => pick(i));
                this.listen(b, 'focus', () => pick(i));
                this.listen(b, 'click', () => this.emit('select', { index: i, value: data[i] }));
            });
            slices.forEach((s, i) => this.listen(s, 'pointerenter', () => pick(i)));
            this.listen(root, 'pointerleave', () => pick(null));
            this.listen(legend, 'focusout', (e) => { if (!legend.contains(e.relatedTarget))
                pick(null); });
            let shown = false;
            this.inView((v) => { if (v && !shown) {
                shown = true;
                root.setAttribute('data-in', '');
                showTotal(0);
            } });
            this.onCleanup(() => { stop(); root.remove(); });
        }
    }, { id: 'parts-kit-12', text: partsKit12.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineDonutChart = defineDonutChart;
exports.donutArcs = donutArcs;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/donut-chart-C0aB3gHH.cjs.map