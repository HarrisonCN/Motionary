'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-sparkline{--usa-sl-c:#7c5cff;position:relative;display:inline-block;width:var(--usa-sl-w,120px);height:var(--usa-sl-h,32px);vertical-align:middle}.usa-sl-svg{display:block;width:100%;height:100%;overflow:visible}.usa-sl-line{fill:none;stroke:var(--usa-sl-c);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round;vector-effect:non-scaling-stroke;stroke-dasharray:1}.usa-sl-area{fill:var(--usa-sl-c);opacity:0}usa-sparkline[data-variant=\"area\"] .usa-sl-area{opacity:.16;transition:opacity .8s .4s}.usa-sl-bars rect{fill:var(--usa-sl-c);opacity:.75}usa-sparkline:not([data-variant=\"bars\"]) .usa-sl-bars,usa-sparkline[data-variant=\"bars\"] .usa-sl-line,usa-sparkline[data-variant=\"bars\"] .usa-sl-end{display:none}.usa-sl-end{fill:var(--usa-sl-c);vector-effect:non-scaling-stroke;transform-box:fill-box;transform-origin:center;animation:usa-sl-pulse 1.8s ease-out infinite}.usa-sl-hover{fill:#fff;stroke:var(--usa-sl-c);stroke-width:1.5;vector-effect:non-scaling-stroke;opacity:0}usa-sparkline[data-hover] .usa-sl-hover{opacity:1}.usa-sl-tip{position:absolute;bottom:calc(100% + 4px);transform:translateX(-50%);padding:2px 6px;border-radius:5px;background:#111827;color:#fff;font:600 11px/1.3 system-ui,sans-serif;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .15s}usa-sparkline[data-hover] .usa-sl-tip{opacity:1}@keyframes usa-sl-pulse{0%{opacity:1;transform:scale(1)}70%{opacity:.4;transform:scale(1.8)}100%{opacity:1;transform:scale(1)}}@media (prefers-reduced-motion:reduce){.usa-sl-end{animation:none}}";

const SPARK_VARIANTS = ['line', 'area', 'bars'];
/** Map values to SVG points in a w×h box (with padding). */
function sparkPoints(vals, w = 100, h = 30, pad = 3) {
    if (!vals.length)
        return [];
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const span = hi - lo || 1;
    return vals.map((v, i) => [vals.length === 1 ? w / 2 : pad + (i / (vals.length - 1)) * (w - pad * 2), h - pad - ((v - lo) / span) * (h - pad * 2)]);
}
function defineSparkline(tag = 'usa-sparkline') {
    return base.defineElement(tag, (Base) => {
        class UsaSparkline extends Base {
            constructor() {
                super(...arguments);
                this._data = [];
                this._drawn = false;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['variant', 'color', 'values', 'label'];
            }
            get data() {
                return this._data.slice();
            }
            set data(v) {
                const from = sparkPoints(this._data);
                this._data = (v || []).map(Number).filter(Number.isFinite);
                if (this.isConnected)
                    this.render(from);
            }
            mount() {
                if (!this._data.length)
                    this._data = this.str('values', '').split(',').map(Number).filter(Number.isFinite);
                const v = this.str('variant', 'line');
                this.dataset.variant = SPARK_VARIANTS.includes(v) ? v : 'line';
                if (this.str('color', ''))
                    this.style.setProperty('--usa-sl-c', this.str('color', ''));
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<svg class="usa-sl-svg" data-usa-part viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path class="usa-sl-area"/><g class="usa-sl-bars"></g><path class="usa-sl-line" pathLength="1"/><circle class="usa-sl-end" r="2.2"/><circle class="usa-sl-hover" r="2.4"/></svg><span class="usa-sl-tip" data-usa-part aria-hidden="true"></span>');
                this.setAttribute('role', 'img');
                this.listen(this, 'pointermove', (e) => this.hover(e));
                this.listen(this, 'pointerleave', () => this.removeAttribute('data-hover'));
                this.onCleanup(() => cancelAnimationFrame(this._raf));
                this.render(null);
                this.inView((vis) => {
                    if (!vis || this._drawn)
                        return;
                    this._drawn = true;
                    const line = this.querySelector('.usa-sl-line');
                    if (line && !this.reduced)
                        this.motion(line, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 900, easing: 'cubic-bezier(.6,.05,.3,1)' });
                });
            }
            summary() {
                const d = this._data;
                if (!d.length)
                    return 'No data';
                const a = d[0];
                const b = d[d.length - 1];
                const pct = a ? Math.round(((b - a) / Math.abs(a)) * 100) : 0;
                return `Trend: ${a} to ${b}${a ? `, ${pct >= 0 ? 'up' : 'down'} ${Math.abs(pct)}%` : ''}`;
            }
            paths(pts) {
                if (!pts.length)
                    return { line: '', area: '' };
                const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join('');
                return { line, area: `${line}L${pts[pts.length - 1][0].toFixed(2)} 30L${pts[0][0].toFixed(2)} 30Z` };
            }
            render(from) {
                this.setAttribute('aria-label', this.str('label', '') || this.summary());
                const to = sparkPoints(this._data);
                const apply = (pts) => {
                    const { line, area } = this.paths(pts);
                    this.querySelector('.usa-sl-line')?.setAttribute('d', line);
                    this.querySelector('.usa-sl-area')?.setAttribute('d', area);
                    const end = pts[pts.length - 1];
                    const c = this.querySelector('.usa-sl-end');
                    if (end && c)
                        (c.setAttribute('cx', end[0].toFixed(2)), c.setAttribute('cy', end[1].toFixed(2)));
                };
                const bars = this.querySelector('.usa-sl-bars');
                if (bars) {
                    const lo = Math.min(0, ...this._data);
                    const hi = Math.max(...this._data, 1);
                    const w = 100 / Math.max(1, this._data.length);
                    bars.innerHTML = this._data.map((v, i) => `<rect x="${(i * w + w * 0.15).toFixed(2)}" width="${(w * 0.7).toFixed(2)}" y="${(30 - ((v - lo) / (hi - lo || 1)) * 28).toFixed(2)}" height="${(((v - lo) / (hi - lo || 1)) * 28).toFixed(2)}" rx="1"/>`).join('');
                }
                if (!from || from.length !== to.length || this.reduced || typeof requestAnimationFrame !== 'function')
                    return apply(to);
                cancelAnimationFrame(this._raf);
                const t0 = performance.now();
                const f = (now) => {
                    const k = Math.min(1, (now - t0) / 500);
                    const e = 1 - Math.pow(1 - k, 3);
                    apply(to.map(([x, y], i) => [from[i][0] + (x - from[i][0]) * e, from[i][1] + (y - from[i][1]) * e]));
                    if (k < 1)
                        this._raf = requestAnimationFrame(f);
                };
                this._raf = requestAnimationFrame(f);
            }
            hover(e) {
                if (!this._data.length)
                    return;
                const r = this.getBoundingClientRect();
                const pts = sparkPoints(this._data);
                const x = ((e.clientX - r.left) / (r.width || 1)) * 100;
                let i = 0;
                pts.forEach(([px], j) => Math.abs(px - x) < Math.abs(pts[i][0] - x) && (i = j));
                const c = this.querySelector('.usa-sl-hover');
                c?.setAttribute('cx', pts[i][0].toFixed(2));
                c?.setAttribute('cy', pts[i][1].toFixed(2));
                const tip = this.querySelector('.usa-sl-tip');
                if (tip) {
                    tip.textContent = String(this._data[i]);
                    tip.style.left = `${pts[i][0]}%`;
                }
                this.toggleAttribute('data-hover', true);
            }
        }
        return UsaSparkline;
    }, { id: 'sparkline', text: css });
}

exports.SPARK_VARIANTS = SPARK_VARIANTS;
exports.defineSparkline = defineSparkline;
exports.sparkPoints = sparkPoints;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/chunks/sparkline-DZiGHCOf.cjs.map