import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make, u as uniqueId } from './moments-Cg_NlOYG.js';
import { l as list, c as cleanColor, a as formatNumber } from './kit-DugHPVcq.js';
import { n as niceTicks, l as linePath } from './kit-13-hC4WCTBH.js';
import { c as css } from './parts-kit-13-CQI5zrN-.js';

const PALETTE = ['#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6'];
/** Series from a `values` attribute: series separated by `|`, numbers by commas or spaces; at most 6 × 200. */
function parseSeries(text) {
    return String(text ?? '').split('|').slice(0, 6).map((s) => s.split(/[\s,]+/).filter(Boolean).slice(0, 200).map(Number).map((n) => (Number.isFinite(n) ? n : 0))).filter((s) => s.length);
}
function defineLineChart(tag = 'usa-line-chart') {
    const ctor = defineElement(tag, Base => class LineChart extends Base {
        constructor() {
            super(...arguments);
            this._data = null;
        }
        static get observedAttributes() { return ['values', 'labels', 'series', 'colors', 'label', 'unit', 'smooth', 'area', 'height']; }
        get data() { return this._data ?? parseSeries(this.str('values')); }
        set data(v) { this._data = Array.isArray(v) ? v.slice(0, 6).map((s) => (Array.isArray(s) ? s.slice(0, 200).map((n) => (Number.isFinite(+n) ? +n : 0)) : [])) : null; this.changed('values'); }
        mount() {
            const data = this.data;
            const n = Math.max(0, ...data.map((s) => s.length));
            const labels = list(this.str('labels'), 200);
            const names = list(this.str('series'), 6);
            const colors = list(this.str('colors'), 6).map(cleanColor);
            const unit = this.str('unit');
            const smooth = this.str('smooth') !== 'false';
            const area = this.str('area') !== 'false';
            const H = Math.max(120, Math.min(600, this.num('height', 220)));
            const W = 600, top = 12, bottom = 26, left = 44, right = 12;
            const ph = H - top - bottom, pw = W - left - right;
            const all = data.flat();
            const ticks = niceTicks(Math.min(0, ...all), Math.max(1, ...all), 4);
            const lo = ticks[0], hi = ticks[ticks.length - 1];
            const id = uniqueId('usa-line');
            const ns = 'http://www.w3.org/2000/svg';
            const el = (t, attrs) => { const e = document.createElementNS(ns, t); for (const [k, v] of Object.entries(attrs))
                e.setAttribute(k, String(v)); return e; };
            const root = make('figure', 'usa-kit usa-lchart');
            root.setAttribute('aria-label', this.str('label', 'Chart'));
            root.toggleAttribute('data-static', this.reduced);
            const plot = make('div', 'usa-lchart-plot');
            plot.tabIndex = 0;
            plot.setAttribute('role', 'img');
            plot.setAttribute('aria-roledescription', 'chart');
            plot.setAttribute('aria-label', this.str('label', 'Chart'));
            const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true', class: 'usa-lchart-svg' });
            const defs = el('defs', {});
            svg.append(defs);
            const grid = el('g', { class: 'usa-lchart-grid' });
            for (const t of ticks) {
                const y = top + ph - ((t - lo) / (hi - lo || 1)) * ph;
                grid.append(el('line', { x1: left, x2: W - right, y1: y, y2: y }));
                const tx = el('text', { x: left - 8, y: y + 4, 'text-anchor': 'end', class: 'usa-lchart-tick' });
                tx.textContent = formatNumber(t, 1);
                grid.append(tx);
            }
            const step = n > 1 ? Math.ceil(n / 6) : 1;
            for (let i = 0; i < n; i += step) {
                const x = left + (n === 1 ? pw / 2 : (i * pw) / (n - 1));
                const tx = el('text', { x, y: H - 6, 'text-anchor': 'middle', class: 'usa-lchart-tick' });
                tx.textContent = labels[i] ?? String(i + 1);
                grid.append(tx);
            }
            svg.append(grid);
            const color = (i) => colors[i] || PALETTE[i % PALETTE.length];
            const groups = data.map((s, si) => {
                const g = el('g', { class: 'usa-lchart-series', transform: `translate(${left},${top})` });
                g.style.setProperty('--c', color(si));
                g.style.setProperty('--i', String(si));
                const d = linePath(s, n > 1 ? ((s.length - 1) / (n - 1)) * pw : pw, ph, lo, hi, smooth);
                if (area && d) {
                    const gid = `${id}-g${si}`;
                    const grad = el('linearGradient', { id: gid, x1: 0, x2: 0, y1: 0, y2: 1 });
                    grad.append(el('stop', { offset: '0', 'stop-color': color(si), 'stop-opacity': '0.28' }), el('stop', { offset: '1', 'stop-color': color(si), 'stop-opacity': '0' }));
                    defs.append(grad);
                    const endX = n > 1 ? ((s.length - 1) / (n - 1)) * pw : pw / 2;
                    const fill = el('path', { d: `${d}L${endX},${ph}L${n > 1 ? 0 : pw / 2},${ph}Z`, fill: `url(#${gid})`, class: 'usa-lchart-area' });
                    g.append(fill);
                }
                const path = el('path', { d, class: 'usa-lchart-line', pathLength: 1 });
                g.append(path);
                svg.append(g);
                return g;
            });
            const cross = el('line', { class: 'usa-lchart-cross', y1: top, y2: top + ph, x1: 0, x2: 0 });
            svg.append(cross);
            const dots = data.map((_, si) => {
                const c = el('circle', { r: 4.5, class: 'usa-lchart-dot' });
                c.style.setProperty('--c', color(si));
                svg.append(c);
                return c;
            });
            const tip = make('div', 'usa-lchart-tip');
            tip.setAttribute('aria-hidden', 'true');
            tip.hidden = true;
            const live = make('span', 'usa-kit-sr');
            live.setAttribute('aria-live', 'polite');
            plot.append(svg, tip, live);
            const legend = make('div', 'usa-lchart-legend');
            const keys = data.map((_, si) => {
                const b = make('button', 'usa-lchart-key');
                b.type = 'button';
                b.setAttribute('aria-pressed', 'true');
                b.style.setProperty('--c', color(si));
                b.append(make('span', 'usa-lchart-swatch'), make('span', '', names[si] || `#${si + 1}`));
                legend.append(b);
                return b;
            });
            const table = make('table', 'usa-kit-sr');
            const thead = make('tr');
            thead.append(make('th', '', ''), ...data.map((_, si) => make('th', '', names[si] || `#${si + 1}`)));
            table.append(thead);
            for (let i = 0; i < n; i++) {
                const tr = make('tr');
                tr.append(make('th', '', labels[i] ?? String(i + 1)), ...data.map((s) => make('td', '', s[i] === undefined ? '' : formatNumber(s[i], 2))));
                table.append(tr);
            }
            if (names.length > 1 || data.length > 1)
                root.append(legend);
            root.append(plot, table);
            this.append(root);
            const hidden = new Set();
            const fmt = (v) => `${formatNumber(v, 2)}${unit ? ` ${unit}` : ''}`;
            let at = -1;
            const show = (i, announce = false) => {
                if (i === null || n === 0) {
                    at = -1;
                    tip.hidden = true;
                    cross.removeAttribute('data-on');
                    dots.forEach((d) => d.removeAttribute('data-on'));
                    return;
                }
                at = Math.max(0, Math.min(n - 1, i));
                const x = left + (n === 1 ? pw / 2 : (at * pw) / (n - 1));
                cross.setAttribute('x1', String(x));
                cross.setAttribute('x2', String(x));
                cross.setAttribute('data-on', '');
                const parts = [];
                tip.replaceChildren(make('strong', '', labels[at] ?? String(at + 1)));
                data.forEach((s, si) => {
                    const v = s[at];
                    const on = v !== undefined && !hidden.has(si);
                    dots[si].toggleAttribute('data-on', on);
                    if (!on)
                        return;
                    dots[si].setAttribute('cx', String(x));
                    dots[si].setAttribute('cy', String(top + ph - ((v - lo) / (hi - lo || 1)) * ph));
                    const row = make('span', 'usa-lchart-row');
                    row.style.setProperty('--c', color(si));
                    row.append(make('i'), `${names[si] || `#${si + 1}`} `, make('b', '', fmt(v)));
                    tip.append(row);
                    parts.push(`${names[si] || `#${si + 1}`} ${fmt(v)}`);
                });
                tip.hidden = false;
                tip.style.setProperty('--x', `${(x / W) * 100}%`);
                tip.toggleAttribute('data-flip', x > W * 0.66);
                if (announce)
                    live.textContent = `${labels[at] ?? at + 1}: ${parts.join(', ')}`;
                this.emit('point', { index: at });
            };
            this.listen(plot, 'pointermove', (e) => {
                const r = svg.getBoundingClientRect();
                if (!r.width)
                    return;
                const x = ((e.clientX - r.left) / r.width) * W;
                show(n > 1 ? Math.round(((x - left) / pw) * (n - 1)) : 0);
            });
            this.listen(plot, 'pointerleave', () => { if (document.activeElement !== plot)
                show(null); });
            this.listen(plot, 'focus', () => show(at < 0 ? n - 1 : at, true));
            this.listen(plot, 'blur', () => show(null));
            this.listen(plot, 'keydown', (e) => {
                const to = e.key === 'ArrowRight' ? at + 1 : e.key === 'ArrowLeft' ? at - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null;
                if (to === null)
                    return;
                e.preventDefault();
                show(to, true);
            });
            keys.forEach((b, si) => this.listen(b, 'click', () => {
                const visible = hidden.has(si);
                if (visible)
                    hidden.delete(si);
                else
                    hidden.add(si);
                b.setAttribute('aria-pressed', String(visible));
                groups[si].toggleAttribute('data-off', !visible);
                if (at >= 0)
                    show(at);
                this.emit('toggle', { series: si, visible });
            }));
            let drawn = false;
            this.inView((v) => { if (v && !drawn) {
                drawn = true;
                root.setAttribute('data-in', '');
            } });
            this.onCleanup(() => root.remove());
        }
    }, { id: 'parts-kit-13', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineLineChart as d, parseSeries as p };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/line-chart-CJunOrDn.js.map