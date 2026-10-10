'use strict';

var base = require('../chunks/base-B3me2y0o.cjs');
var shared = require('../chunks/shared-BxK1D7EZ.cjs');

var css = "usa-gauge{--usa-gg-c:#7c5cff;--usa-gg-k:0;position:relative;display:inline-block;width:var(--usa-gg-w,220px);max-width:100%;font:600 12px/1.2 system-ui,sans-serif;text-align:center}.usa-gg-svg{display:block;width:100%;height:auto;overflow:visible}.usa-gg-track,.usa-gg-arc{fill:none;stroke-width:16;stroke-linecap:round}.usa-gg-track{stroke:rgba(127,127,127,.2)}.usa-gg-arc{stroke:var(--usa-gg-c);stroke-dasharray:calc(max(var(--usa-gg-k),0) * 100) 100;transition:stroke .3s}.usa-gg-needle{transform-origin:100px 100px;transform:rotate(var(--usa-gg-angle,-90deg));fill:currentColor}.usa-gg-read{position:absolute;left:0;right:0;bottom:2px;display:flex;flex-direction:column;align-items:center;pointer-events:none}.usa-gg-num{font:800 22px/1 system-ui,sans-serif;font-variant-numeric:tabular-nums;transform:translateY(-34px)}.usa-gg-label{opacity:.65;transform:translateY(-34px)}";

function defineGauge(tag = 'usa-gauge') {
    return base.defineElement(tag, (Base) => {
        class UsaGauge extends Base {
            constructor() {
                super(...arguments);
                this._v = 0;
                this._shown = 0;
                this._vel = 0;
                this._raf = 0;
            }
            static get observedAttributes() {
                return ['min', 'max', 'zones', 'unit', 'label', 'value'];
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this._v = shared.clampN(Number(v) || 0, this.num('min', 0), this.num('max', 100));
                this.setAttribute('aria-valuenow', String(this._v));
                this.animateTo();
            }
            mount() {
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.insertAdjacentHTML('afterbegin', '<svg class="usa-gg-svg" data-usa-part aria-hidden="true" viewBox="0 0 200 120"><path class="usa-gg-track" d="M20 100 A80 80 0 0 1 180 100"/><path class="usa-gg-arc" d="M20 100 A80 80 0 0 1 180 100" pathLength="100"/><g class="usa-gg-needle"><path d="M100 100 L96 100 L100 30 L104 100 Z"/><circle cx="100" cy="100" r="7"/></g></svg><div class="usa-gg-read" data-usa-part aria-hidden="true"><b class="usa-gg-num">0</b><span class="usa-gg-label"></span></div>');
                this.querySelector('.usa-gg-label').textContent = this.str('label', '');
                this.setAttribute('role', 'meter');
                this.setAttribute('aria-valuemin', String(this.num('min', 0)));
                this.setAttribute('aria-valuemax', String(this.num('max', 100)));
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Gauge'));
                this._v = shared.clampN(this.num('value', 0), this.num('min', 0), this.num('max', 100));
                this.setAttribute('aria-valuenow', String(this._v));
                this._shown = this.reduced ? this._v : this.num('min', 0);
                this.paint();
                this.onCleanup(() => cancelAnimationFrame(this._raf));
                this.inView((v) => v && this.animateTo());
            }
            /** Colour of the zone containing `v`. */
            zoneColor(v) {
                const zones = this.str('zones', '').split(',').map((z) => z.split(':')).filter((z) => z.length === 2).map(([b, c]) => [Number(b), c.trim()]).sort((a, b) => a[0] - b[0]);
                for (const [b, c] of zones)
                    if (v <= b)
                        return c;
                return zones.length ? zones[zones.length - 1][1] : '';
            }
            paint() {
                const lo = this.num('min', 0);
                const hi = this.num('max', 100);
                const k = shared.clampN((this._shown - lo) / (hi - lo || 1), -0.05, 1.05);
                this.style.setProperty('--usa-gg-k', k.toFixed(4));
                this.style.setProperty('--usa-gg-angle', `${ -90 + k * 180}deg`);
                const z = this.zoneColor(this._shown);
                if (z)
                    this.style.setProperty('--usa-gg-c', z);
                const num = this.querySelector('.usa-gg-num');
                if (num)
                    num.textContent = `${Math.round(shared.clampN(this._shown, lo, hi))}${this.str('unit', '')}`;
                this.setAttribute('aria-valuetext', `${Math.round(this._v)}${this.str('unit', '')}`);
            }
            animateTo() {
                if (this.reduced || typeof requestAnimationFrame !== 'function') {
                    this._shown = this._v;
                    return this.paint();
                }
                if (this._raf)
                    return;
                let last = 0;
                const f = (now) => {
                    const dt = last ? Math.min(0.033, (now - last) / 1000) : 1 / 60;
                    last = now;
                    const span = this.num('max', 100) - this.num('min', 0) || 1;
                    this._vel += (120 * (this._v - this._shown) - 11 * this._vel) * dt;
                    this._shown += this._vel * dt;
                    this.paint();
                    if (Math.abs(this._v - this._shown) / span > 0.0005 || Math.abs(this._vel) / span > 0.002)
                        this._raf = requestAnimationFrame(f);
                    else
                        ((this._raf = 0), (this._shown = this._v), (this._vel = 0), this.paint());
                };
                this._raf = requestAnimationFrame(f);
            }
        }
        return UsaGauge;
    }, { id: 'gauge', text: css });
}

exports.defineGauge = defineGauge;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.0.0/dist/widgets/gauge.cjs.map