import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { c as clampN } from '../chunks/shared-C8Pi6tuh.js';

var css = "usa-volume-knob{--usa-vk-c:#22d3ee;--usa-vk-size:120px;position:relative;display:inline-grid;place-items:center;width:var(--usa-vk-size);height:var(--usa-vk-size);border-radius:50%;cursor:ns-resize;touch-action:none;user-select:none;outline-offset:6px}.usa-vk-arc{position:absolute;inset:0;width:100%;height:100%;overflow:visible}.usa-vk-arc path{fill:none;stroke-width:6;stroke-linecap:round}.usa-vk-bg{stroke:rgba(127,127,127,.25)}.usa-vk-val{stroke:var(--usa-vk-c);filter:drop-shadow(0 0 4px var(--usa-vk-c))}.usa-vk-ticks{position:absolute;inset:0}.usa-vk-ticks i{position:absolute;left:50%;top:50%;width:3px;height:3px;margin:-1.5px;border-radius:50%;background:rgba(127,127,127,.4);transform:rotate(var(--a)) translateY(calc(var(--usa-vk-size) * -.5 + 2px));transition:background .2s,box-shadow .2s}.usa-vk-ticks i[data-on]{background:var(--usa-vk-c);box-shadow:0 0 6px var(--usa-vk-c)}.usa-vk-cap{position:relative;width:62%;height:62%;border-radius:50%;background:radial-gradient(circle at 35% 30%,#4b5563,#111827 70%);box-shadow:0 8px 16px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.15);transform:rotate(var(--usa-vk-angle));transition:transform .35s cubic-bezier(.3,1.5,.5,1)}usa-volume-knob[data-drag] .usa-vk-cap{transition:none}.usa-vk-dot{position:absolute;left:50%;top:10%;width:6px;height:6px;margin-left:-3px;border-radius:50%;background:var(--usa-vk-c);box-shadow:0 0 6px var(--usa-vk-c)}usa-volume-knob:focus-visible{outline:2px solid var(--usa-vk-c)}@media (prefers-reduced-motion:reduce){.usa-vk-cap,.usa-vk-ticks i{transition:none}}";

const ARC = 270;
function defineVolumeKnob(tag = 'usa-volume-knob') {
    return defineElement(tag, (Base) => {
        class UsaVolumeKnob extends Base {
            constructor() {
                super(...arguments);
                this._v = 50;
            }
            static get observedAttributes() {
                return ['min', 'max', 'label'];
            }
            get value() {
                return this._v;
            }
            set value(v) {
                this.set(v, false);
            }
            mount() {
                this._v = clampN(this.num('value', 50), this.num('min', 0), this.num('max', 100));
                this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
                const ticks = Array.from({ length: 21 }, (_, i) => `<i style="--a:${-ARC / 2 + (i / 20) * ARC}deg"></i>`).join('');
                this.insertAdjacentHTML('afterbegin', `<span class="usa-vk-ticks" data-usa-part aria-hidden="true">${ticks}</span><svg class="usa-vk-arc" data-usa-part aria-hidden="true" viewBox="0 0 100 100"><path class="usa-vk-bg" d="${this.arc(1)}"/><path class="usa-vk-val" d="${this.arc(1)}"/></svg><span class="usa-vk-cap" data-usa-part aria-hidden="true"><span class="usa-vk-dot"></span></span>`);
                this.setAttribute('role', 'slider');
                if (!this.hasAttribute('tabindex'))
                    this.tabIndex = 0;
                if (!this.hasAttribute('aria-label'))
                    this.setAttribute('aria-label', this.str('label', 'Volume'));
                this.setAttribute('aria-valuemin', String(this.num('min', 0)));
                this.setAttribute('aria-valuemax', String(this.num('max', 100)));
                this.listen(this, 'keydown', (e) => {
                    const span = this.num('max', 100) - this.num('min', 0);
                    const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: span / 10, PageDown: -span / 10, Home: -Infinity, End: Infinity };
                    if (!(e.key in d))
                        return;
                    e.preventDefault();
                    this.set(this._v + d[e.key], true, true);
                });
                this.listen(this, 'wheel', (e) => {
                    e.preventDefault();
                    this.set(this._v - Math.sign(e.deltaY) * 2, true, true);
                }, { passive: false });
                this.listen(this, 'pointerdown', (e) => {
                    const y0 = e.clientY;
                    const v0 = this._v;
                    const span = this.num('max', 100) - this.num('min', 0);
                    this.setPointerCapture?.(e.pointerId);
                    this.toggleAttribute('data-drag', true);
                    const move = (ev) => this.set(v0 + ((y0 - ev.clientY) / 150) * span, true);
                    const up = () => {
                        this.removeAttribute('data-drag');
                        this.removeEventListener('pointermove', move);
                        this.removeEventListener('pointerup', up);
                        this.emit('change', { value: this._v });
                    };
                    this.addEventListener('pointermove', move);
                    this.addEventListener('pointerup', up);
                });
                this.paint();
            }
            /** SVG arc path for fraction `k` (0–1) of the 270° sweep. */
            arc(k) {
                const a0 = ((-ARC / 2 - 90) * Math.PI) / 180;
                const a1 = a0 + ((ARC * Math.max(0.0001, k)) * Math.PI) / 180;
                const p = (a) => `${(50 + 42 * Math.cos(a)).toFixed(2)} ${(50 + 42 * Math.sin(a)).toFixed(2)}`;
                return `M${p(a0)} A42 42 0 ${ARC * k > 180 ? 1 : 0} 1 ${p(a1)}`;
            }
            paint() {
                const lo = this.num('min', 0);
                const hi = this.num('max', 100);
                const k = (this._v - lo) / (hi - lo || 1);
                this.style.setProperty('--usa-vk-angle', `${-ARC / 2 + k * ARC}deg`);
                this.querySelector('.usa-vk-val')?.setAttribute('d', this.arc(k));
                this.querySelectorAll('.usa-vk-ticks i').forEach((t, i) => t.toggleAttribute('data-on', i / 20 <= k + 1e-6 && k > 0));
                this.setAttribute('aria-valuenow', String(Math.round(this._v)));
                this.setAttribute('value', String(Math.round(this._v)));
            }
            set(v, user, commit = false) {
                const n = clampN(Math.round(v), this.num('min', 0), this.num('max', 100));
                if (n === this._v)
                    return;
                this._v = n;
                this.paint();
                if (user)
                    this.emit('input', { value: n });
                if (commit)
                    this.emit('change', { value: n });
            }
        }
        return UsaVolumeKnob;
    }, { id: 'volume-knob', text: css });
}

export { defineVolumeKnob };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.9.0/dist/widgets/volume-knob.js.map