import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { m as micro } from '../chunks/micro-DxpcOO8J.js';
import { h as hostSprings, v as valueAt, t as tick, a as holdDelays, f as fraction } from '../chunks/micro-kit-16-DrJflWG2.js';
import { c as css } from '../chunks/micro-kit-16-BwBnmnaq.js';

function defineMicroStepper(tag = 'usa-micro-stepper') {
    const ctor = defineElement(tag, (Base) => class MicroStepper extends Base {
        constructor() {
            super(...arguments);
            this._value = NaN;
            this._set = null;
        }
        static get observedAttributes() {
            return ['min', 'max', 'step', 'value', 'label', 'name', 'disabled', 'feel', 'haptics'];
        }
        get value() {
            return this._value;
        }
        set value(n) {
            if (this._set)
                this._set(Number(n));
            else
                this._value = Number(n);
        }
        mount() {
            let min = this.num('min', 0);
            let max = this.num('max', 99);
            if (max < min)
                [min, max] = [max, min];
            const step = Math.max(Number.EPSILON, this.num('step', 1));
            const attr = this.getAttribute('value');
            if (attr !== this._seen) {
                this._seen = attr;
                this._value = this.num('value', min);
            }
            const snap = (n) => valueAt(fraction(n, min, max), min, max, step);
            this._value = snap(Number.isFinite(this._value) ? this._value : min);
            const disabled = this.flag('disabled');
            const label = this.str('label', 'Quantity');
            const root = make('div', 'usa-mkit usa-mstep');
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', label);
            const minus = make('button', 'usa-mstep-btn', '−');
            minus.type = 'button';
            minus.setAttribute('aria-label', `Decrease ${label}`);
            const plus = make('button', 'usa-mstep-btn', '+');
            plus.type = 'button';
            plus.setAttribute('aria-label', `Increase ${label}`);
            const box = make('div', 'usa-mstep-value');
            box.setAttribute('role', 'spinbutton');
            box.tabIndex = disabled ? -1 : 0;
            box.setAttribute('aria-label', label);
            box.setAttribute('aria-valuemin', String(min));
            box.setAttribute('aria-valuemax', String(max));
            const now = make('span', 'usa-mstep-num');
            const old = make('span', 'usa-mstep-num usa-mstep-old');
            old.setAttribute('aria-hidden', 'true');
            box.append(old, now);
            minus.disabled = plus.disabled = disabled;
            root.append(minus, box, plus);
            const hidden = this.str('name') ? make('input') : null;
            if (hidden) {
                hidden.type = 'hidden';
                hidden.name = this.str('name');
                root.append(hidden);
            }
            this.append(root);
            const presses = [minus, plus].map((b) => micro(b, 'press', { pressScale: 0.9, feel: this.str('feel') || undefined }));
            let dir = 1;
            const group = hostSprings(this, { r: 0, k: 0 }, (v) => {
                const r = v.r;
                now.style.transform = `translateY(${Math.round(r * 1000) / 10}%)`;
                old.style.transform = `translateY(${Math.round((r - dir) * 1000) / 10}%)`;
                old.style.opacity = String(Math.max(0, Math.min(1, Math.abs(r) * 1.4)));
                box.style.transform = Math.abs(v.k) > 0.05 ? `translateX(${Math.round(v.k * 10) / 10}px)` : '';
            });
            const paint = () => {
                now.textContent = String(this._value);
                box.setAttribute('aria-valuenow', String(this._value));
                minus.setAttribute('aria-disabled', String(this._value <= min));
                plus.setAttribute('aria-disabled', String(this._value >= max));
                if (hidden)
                    hidden.value = String(this._value);
            };
            paint();
            const set = (n, emit = true) => {
                const next = snap(n);
                if (next === this._value)
                    return false;
                dir = next > this._value ? 1 : -1;
                old.textContent = String(this._value);
                this._value = next;
                paint();
                // the new number comes in from below when it grows (from above when it shrinks)
                group.jump({ r: dir });
                group.set({ r: 0 }, { spring: 'bouncy' });
                tick(this, 6);
                if (emit)
                    this.emit('change', { value: next });
                return true;
            };
            this._set = (n) => Number.isFinite(n) && set(n, false);
            const bump = (sign) => {
                if (sign < 0 ? this._value <= min : this._value >= max) {
                    group.impulse({ k: sign * 220 }, '200 0.7');
                    tick(this, [6, 30, 6]);
                    return false;
                }
                return set(this._value + sign * step);
            };
            let timer;
            let fromPointer = false;
            const stop = () => clearTimeout(timer);
            const hold = (sign) => {
                const delays = holdDelays(60);
                let i = 0;
                const next = () => {
                    if (!bump(sign))
                        return stop();
                    timer = setTimeout(next, delays[Math.min(++i, delays.length - 1)]);
                };
                if (!bump(sign))
                    return;
                timer = setTimeout(next, delays[0]);
            };
            for (const [btn, sign] of [[minus, -1], [plus, 1]]) {
                this.listen(btn, 'pointerdown', (e) => {
                    if (disabled || (e.pointerType === 'mouse' && e.button !== 0))
                        return;
                    fromPointer = true;
                    stop();
                    hold(sign);
                });
                for (const t of ['pointerup', 'pointerleave', 'pointercancel'])
                    this.listen(btn, t, stop);
                this.listen(btn, 'click', () => {
                    // a click from the keyboard (no pointer down before it) steps once
                    if (fromPointer) {
                        fromPointer = false;
                        return;
                    }
                    if (!disabled)
                        bump(sign);
                });
            }
            this.listen(box, 'keydown', (e) => {
                if (disabled)
                    return;
                const keys = {
                    ArrowUp: () => bump(1), ArrowDown: () => bump(-1), PageUp: () => set(this._value + step * 10) || bump(1),
                    PageDown: () => set(this._value - step * 10) || bump(-1), Home: () => set(min) || bump(-1), End: () => set(max) || bump(1),
                };
                if (!keys[e.key])
                    return;
                e.preventDefault();
                keys[e.key]();
            });
            this.onCleanup(() => {
                stop();
                group.stop();
                presses.forEach((h) => h.destroy());
                root.remove();
                this._set = null;
            });
        }
    }, { id: 'micro-kit-16', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineMicroStepper };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/micro-stepper.js.map