'use strict';

var base = require('./base-B3me2y0o.cjs');
var shared = require('./shared-BxK1D7EZ.cjs');

var css = "usa-equalizer{--usa-eq-c:#7c5cff;position:relative;display:block;width:var(--usa-eq-w,320px);max-width:100%;padding:12px 10px 8px;border-radius:16px;background:var(--usa-eq-bg,#0f172a);color:#cbd5e1;font:600 10px/1 system-ui,sans-serif}.usa-eq-curve{position:absolute;left:10px;right:10px;top:12px;height:120px;width:calc(100% - 20px);pointer-events:none;overflow:visible}.usa-eq-curve path{fill:none;stroke:#22d3ee;stroke-width:1.6;vector-effect:non-scaling-stroke;opacity:.8;transition:d .45s cubic-bezier(.3,1.3,.5,1)}.usa-eq-bands{display:flex;justify-content:space-between;gap:4px}.usa-eq-band{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;min-width:0}.usa-eq-slot{--usa-eq-k:.5;position:relative;width:8px;height:120px;border-radius:6px;background:rgba(148,163,184,.18);cursor:ns-resize;touch-action:none;outline-offset:4px}.usa-eq-fill{position:absolute;left:0;right:0;top:calc((1 - max(var(--usa-eq-k),.5)) * 100%);bottom:calc(min(var(--usa-eq-k),.5) * 100%);border-radius:6px;background:var(--usa-eq-c)}.usa-eq-cap{position:absolute;left:50%;top:calc((1 - var(--usa-eq-k)) * 100%);width:20px;height:10px;margin:-5px 0 0 -10px;border-radius:4px;background:#f8fafc;box-shadow:0 2px 6px rgba(0,0,0,.5)}usa-equalizer[data-glide] .usa-eq-cap{transition:top .5s cubic-bezier(.3,1.4,.5,1)}usa-equalizer[data-glide] .usa-eq-fill{transition:top .5s cubic-bezier(.3,1.4,.5,1),bottom .5s cubic-bezier(.3,1.4,.5,1)}.usa-eq-slot[data-drag] .usa-eq-cap{transform:scale(1.15)}.usa-eq-slot:focus-visible{outline:2px solid #22d3ee}.usa-eq-label{opacity:.7;white-space:nowrap}@media (prefers-reduced-motion:reduce){.usa-eq-cap,.usa-eq-fill,.usa-eq-curve path{transition:none!important}}";

const EQ_PRESETS = {
    flat: [0, 0, 0, 0, 0, 0, 0],
    bass: [8, 6, 3, 0, -1, -1, 0],
    vocal: [-3, -1, 2, 5, 4, 1, -1],
    rock: [5, 3, -1, -2, 1, 4, 6],
    electronic: [6, 4, 0, -2, 2, 5, 7],
};
function defineEqualizer(tag = 'usa-equalizer') {
    return base.defineElement(tag, (Base) => {
        class UsaEqualizer extends Base {
            constructor() {
                super(...arguments);
                this._v = [];
            }
            static get observedAttributes() {
                return ['bands'];
            }
            get values() {
                return this._v.slice();
            }
            set values(v) {
                v.forEach((x, i) => (this._v[i] = shared.clampN(Math.round(x), -12, 12)));
                this.paint(true);
            }
            mount() {
                const labels = this.str('bands', '60,150,400,1k,2.4k,6k,16k').split(',').map((s) => s.trim()).filter(Boolean);
                const pre = EQ_PRESETS[this.str('preset', 'flat')] || EQ_PRESETS.flat;
                this._v = labels.map((_, i) => pre[Math.round((i / Math.max(1, labels.length - 1)) * (pre.length - 1))] || 0);
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                this.setAttribute('role', 'group');
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Equalizer'));
                const bands = labels.map((l, i) => `<div class="usa-eq-band"><div class="usa-eq-slot" role="slider" tabindex="0" aria-orientation="vertical" aria-valuemin="-12" aria-valuemax="12" aria-label="${l} Hz" data-i="${i}"><span class="usa-eq-fill"></span><span class="usa-eq-cap"></span></div><span class="usa-eq-label">${l}</span></div>`).join('');
                this.insertAdjacentHTML('afterbegin', `<svg class="usa-eq-curve" data-usa-part aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100"><path/></svg><div class="usa-eq-bands" data-usa-part>${bands}</div>`);
                this.querySelectorAll('.usa-eq-slot').forEach((slot) => {
                    const i = Number(slot.dataset.i);
                    this.listen(slot, 'keydown', (e) => {
                        const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 3, PageDown: -3 };
                        if (!(e.key in d))
                            return;
                        e.preventDefault();
                        this.setBand(i, this._v[i] + d[e.key]);
                    });
                    this.listen(slot, 'pointerdown', (e) => {
                        slot.setPointerCapture?.(e.pointerId);
                        slot.toggleAttribute('data-drag', true);
                        const at = (ev) => {
                            const r = slot.getBoundingClientRect();
                            this.setBand(i, 12 - shared.clampN((ev.clientY - r.top) / (r.height || 1), 0, 1) * 24);
                        };
                        at(e);
                        const up = () => (slot.removeAttribute('data-drag'), slot.removeEventListener('pointermove', at), slot.removeEventListener('pointerup', up));
                        slot.addEventListener('pointermove', at);
                        slot.addEventListener('pointerup', up);
                    });
                });
                this.paint(false);
            }
            setBand(i, v) {
                const n = shared.clampN(Math.round(v), -12, 12);
                if (n === this._v[i])
                    return;
                this._v[i] = n;
                this.paint(false);
                this.emit('change', { values: this.values });
            }
            applyPreset(name) {
                const p = EQ_PRESETS[name];
                if (!p)
                    return;
                const n = this._v.length;
                this._v = this._v.map((_, i) => p[Math.round((i / Math.max(1, n - 1)) * (p.length - 1))] || 0);
                this.paint(true);
                this.emit('change', { values: this.values });
            }
            paint(glide) {
                this.toggleAttribute('data-glide', glide && !this.reduced);
                const slots = this.querySelectorAll('.usa-eq-slot');
                slots.forEach((s, i) => {
                    const v = this._v[i] ?? 0;
                    s.style.setProperty('--usa-eq-k', ((v + 12) / 24).toFixed(4));
                    s.setAttribute('aria-valuenow', String(v));
                    s.setAttribute('aria-valuetext', `${v > 0 ? '+' : ''}${v} dB`);
                });
                const n = this._v.length;
                const pts = this._v.map((v, i) => [((i + 0.5) / n) * 100, 50 - (v / 12) * 40]);
                let d = `M0 ${pts[0]?.[1] ?? 50}`;
                pts.forEach(([x, y], i) => {
                    const [px, py] = i ? pts[i - 1] : [0, pts[0][1]];
                    d += ` C${((px + x) / 2).toFixed(2)} ${py.toFixed(2)} ${((px + x) / 2).toFixed(2)} ${y.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
                });
                d += ` L100 ${pts[n - 1]?.[1] ?? 50}`;
                this.querySelector('.usa-eq-curve path')?.setAttribute('d', d);
            }
        }
        return UsaEqualizer;
    }, { id: 'equalizer', text: css });
}

exports.EQ_PRESETS = EQ_PRESETS;
exports.defineEqualizer = defineEqualizer;
//# sourceMappingURL=equalizer-GY-Qul0f.cjs.map
