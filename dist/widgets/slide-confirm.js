import { f as defineElement, C as srText } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { d as dampedAt } from '../chunks/damped-kit-18-ykWuNSDE.js';
import { g as slideOutcome, h as frameOnce } from '../chunks/fling-kit-19-Q_8uCj02.js';
import { c as css } from '../chunks/fling-kit-19-5HLYwuL1.js';

const NS = 'http://www.w3.org/2000/svg';
const icon = (d) => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    svg.append(p);
    return svg;
};
const ARROW = 'M5 12h13M13 6l6 6-6 6';
const CHECK = 'M5 12.5l4.5 4.5L19 7.5';
function defineSlideConfirm(tag = 'usa-slide-confirm') {
    const ctor = defineElement(tag, (Base) => class SlideConfirm extends Base {
        constructor() {
            super(...arguments);
            this._done = false;
            this._api = null;
        }
        static get observedAttributes() {
            return ['label', 'done', 'threshold', 'confirmed', 'disabled', 'feel', 'haptics'];
        }
        get confirmed() {
            return this._done;
        }
        confirm() {
            if (this._api)
                this._api.confirm();
            else
                this._done = true;
        }
        reset() {
            if (this._api)
                this._api.reset();
            else
                this._done = false;
        }
        mount() {
            const attr = this.hasAttribute('confirmed');
            if (attr !== this._seen) {
                this._seen = attr;
                this._done = attr;
            }
            const prompt = this.str('label', 'Slide to confirm');
            const doneText = this.str('done', 'Confirmed');
            const threshold = Math.min(1, Math.max(0.05, this.num('threshold', 0.8)));
            const off = this.flag('disabled');
            const root = make('div', 'usa-fkit usa-slide');
            const fill = make('div', 'usa-slide-fill');
            const text = make('span', 'usa-slide-text');
            text.setAttribute('aria-hidden', 'true');
            const knob = make('button', 'usa-slide-knob');
            knob.type = 'button';
            knob.disabled = off;
            const status = srText('');
            status.setAttribute('role', 'status');
            root.append(fill, text, knob, status);
            this.append(root);
            let max = 0;
            const measure = () => {
                const w = root.clientWidth || 300;
                const k = knob.offsetWidth || 48;
                max = Math.max(1, w - k - 8);
            };
            measure();
            const group = hostSprings(this, { x: this._done ? max : 0 }, (v) => {
                const x = v.x;
                knob.style.transform = `translateX(${Math.round(x * 10) / 10}px)`;
                fill.style.width = `calc(var(--usa-slide-h) + ${Math.round(Math.max(0, x) * 10) / 10}px)`;
                text.style.opacity = this._done ? '1' : String(Math.round(Math.max(0, 1 - (x / max) * 1.4) * 1000) / 1000);
            });
            const paint = () => {
                root.toggleAttribute('data-confirmed', this._done);
                text.textContent = this._done ? doneText : prompt;
                knob.setAttribute('aria-label', this._done ? doneText : prompt);
                knob.setAttribute('aria-disabled', String(this._done || off));
                knob.replaceChildren(icon(this._done ? CHECK : ARROW));
            };
            const confirm = (velocity = 0) => {
                if (this._done || off)
                    return;
                this._done = true;
                measure();
                paint();
                group.set({ x: max }, { spring: { duration: 420, bounce: 0.18 }, velocity: velocity ? { x: velocity } : undefined });
                status.textContent = doneText;
                tick(this, [10, 30, 16]);
                this.emit('confirm', {});
            };
            const reset = () => {
                if (!this._done)
                    return;
                this._done = false;
                paint();
                group.set({ x: 0 }, { spring: { duration: 560, bounce: 0.2 } });
                status.textContent = '';
                this.emit('reset', {});
            };
            this._api = { confirm, reset };
            paint();
            group.jump({ x: this._done ? max : 0 });
            // a click with no pointer behind it (detail 0) is Enter or Space: confirm; pointer clicks are the slide's
            this.listen(knob, 'click', (e) => {
                if (e.detail === 0)
                    confirm();
            });
            let drag = null;
            this.listen(knob, 'pointerdown', (e) => {
                if ((e.pointerType === 'mouse' && e.button !== 0) || this._done || off)
                    return;
                measure();
                drag = { id: e.pointerId, x0: e.clientX, from: group.get('x'), last: e.clientX, t: e.timeStamp, v: 0 };
                root.setAttribute('data-dragging', '');
                try {
                    knob.setPointerCapture?.(e.pointerId);
                }
                catch {
                    /* synthetic */
                }
            });
            this.listen(knob, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const dt = Math.max(1, e.timeStamp - drag.t);
                drag.v = drag.v * 0.4 + (((e.clientX - drag.last) / dt) * 1000) * 0.6;
                drag.last = e.clientX;
                drag.t = e.timeStamp;
                group.jump({ x: dampedAt(drag.from + e.clientX - drag.x0, 0, max, max * 0.5) });
            });
            const end = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const d = drag;
                drag = null;
                root.removeAttribute('data-dragging');
                const x = group.get('x');
                if (e.type === 'pointerup' && slideOutcome(x, d.v, max, threshold))
                    confirm(d.v);
                else
                    group.set({ x: 0 }, { spring: { duration: 560, bounce: 0.38 }, velocity: { x: d.v } });
            };
            this.listen(knob, 'pointerup', end);
            this.listen(knob, 'pointercancel', end);
            if (typeof ResizeObserver !== 'undefined') {
                const later = frameOnce(() => {
                    measure();
                    if (!group.animating && !drag)
                        group.jump({ x: this._done ? max : 0 });
                }, this);
                const ro = new ResizeObserver(() => later.ask());
                ro.observe(root);
                this.onCleanup(() => {
                    ro.disconnect();
                    later.cancel();
                });
            }
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._api = null;
            });
        }
    }, { id: 'fling-kit-19', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSlideConfirm };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/slide-confirm.js.map