import { f as defineElement, o as onFrame } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { w as wrapOffset, h as frameOnce, d as cruise } from '../chunks/fling-kit-19-Q_8uCj02.js';
import { c as css } from '../chunks/fling-kit-19-5HLYwuL1.js';

const NS = 'http://www.w3.org/2000/svg';
const glyph = (paused) => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 14 14');
    svg.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', paused ? 'M3 1.5v11l9-5.5z' : 'M2.5 1.5h3.2v11H2.5zM8.3 1.5h3.2v11H8.3z');
    svg.append(p);
    return svg;
};
function defineFlingMarquee(tag = 'usa-fling-marquee') {
    const ctor = defineElement(tag, (Base) => class FlingMarquee extends Base {
        constructor() {
            super(...arguments);
            this._paused = false;
            this._source = null;
            this._api = null;
        }
        static get observedAttributes() {
            return ['speed', 'gap', 'paused', 'label', 'haptics'];
        }
        get paused() {
            return this._paused;
        }
        set paused(v) {
            if (this._api)
                this._api.pause(!!v, false);
            else
                this._paused = !!v;
        }
        fling(velocity) {
            this._api?.fling(velocity);
        }
        mount() {
            if (!this._source) {
                this._source = [...this.childNodes].filter((n) => n.nodeType === 1 || (n.nodeType === 3 && n.textContent?.trim()));
                [...this.childNodes].forEach((n) => this.removeChild(n));
            }
            const attr = this.hasAttribute('paused');
            if (attr !== this._seen) {
                this._seen = attr;
                this._paused = attr;
            }
            const speed = Math.min(2000, Math.max(-2e3, this.num('speed', 40)));
            const gap = Math.max(0, this.num('gap', 24));
            const still = this.reduced;
            const root = make('div', 'usa-fkit usa-fmq');
            root.style.setProperty('--usa-fmq-gap', `${gap}px`);
            root.toggleAttribute('data-static', still);
            const view = make('div', 'usa-fmq-view');
            view.tabIndex = 0;
            view.setAttribute('role', 'region');
            view.setAttribute('aria-label', this.str('label', 'Scrolling list'));
            const track = make('div', 'usa-fmq-track');
            const run = make('div', 'usa-fmq-run');
            run.append(...this._source.map((n) => n.cloneNode(true)));
            track.append(run);
            view.append(track);
            const toggle = make('button', 'usa-fmq-toggle');
            toggle.type = 'button';
            root.append(view);
            if (!still)
                root.append(toggle);
            this.append(root);
            if (still) {
                this._api = { pause: (on) => (this._paused = on), fling: () => { } };
                this.onCleanup(() => {
                    root.remove();
                    this._api = null;
                });
                return;
            }
            // copies fill the view so the loop never shows a gap; they are hidden from assistive tech and from Tab
            let period = 0;
            const fill = () => {
                period = run.offsetWidth || 0;
                const need = period > 0 ? Math.max(1, Math.ceil((view.clientWidth || 0) / period) + 1) : 1;
                while (track.children.length - 1 < need) {
                    const copy = run.cloneNode(true);
                    copy.setAttribute('aria-hidden', 'true');
                    copy.setAttribute('inert', '');
                    track.append(copy);
                }
            };
            fill();
            const paint = () => {
                toggle.setAttribute('aria-label', this._paused ? 'Play' : 'Pause');
                toggle.setAttribute('aria-pressed', String(this._paused));
                toggle.replaceChildren(glyph(this._paused));
            };
            paint();
            let x = 0;
            let v = this._paused ? 0 : speed;
            let hover = false;
            let focus = false;
            let drag = null;
            const place = () => {
                x = wrapOffset(x, period || 1);
                track.style.transform = `translateX(${Math.round(-x * 10) / 10}px)`;
            };
            const frame = (_t, dt) => {
                if (drag)
                    return;
                const target = this._paused || hover || focus ? 0 : speed;
                // a fling decays toward the cruise speed (or rest) with a longer time constant than a plain slow-down
                v = cruise(v, target, dt, Math.abs(v) > Math.abs(speed) * 1.5 ? 900 : 520);
                x += (v * Math.min(64, dt)) / 1000;
                place();
            };
            let stop = null;
            const loop = (on) => {
                if (on && !stop)
                    stop = onFrame(frame, this);
                else if (!on && stop) {
                    stop();
                    stop = null;
                }
            };
            this.inView((visible) => loop(visible));
            const pause = (on, user) => {
                if (on === this._paused)
                    return;
                this._paused = on;
                paint();
                if (user)
                    tick(this, 6);
                this.emit('pause', { paused: on });
            };
            this._api = { pause, fling: (vel) => (v = Math.max(-4e3, Math.min(4000, v + (Number(vel) || 0)))) };
            this.listen(toggle, 'click', () => pause(!this._paused, true));
            this.listen(view, 'keydown', (e) => {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')
                    return;
                e.preventDefault();
                const dir = getComputedStyle(this).direction === 'rtl' ? -1 : 1;
                v = Math.max(-4e3, Math.min(4000, v + (e.key === 'ArrowRight' ? 700 : -700) * dir));
            });
            this.listen(root, 'pointerenter', (e) => {
                if (e.pointerType === 'mouse')
                    hover = true;
            });
            this.listen(root, 'pointerleave', () => (hover = false));
            this.listen(root, 'focusin', () => (focus = true));
            this.listen(root, 'focusout', (e) => {
                if (!root.contains(e.relatedTarget))
                    focus = false;
            });
            this.listen(view, 'pointerdown', (e) => {
                if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest?.('a, button, input, textarea, select, [contenteditable]'))
                    return;
                drag = { id: e.pointerId, x0: e.clientX, from: x, last: e.clientX, t: e.timeStamp, v: 0, live: false };
            });
            this.listen(view, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                if (!drag.live) {
                    if (Math.abs(e.clientX - drag.x0) < 5)
                        return;
                    drag.live = true;
                    root.setAttribute('data-dragging', '');
                    try {
                        view.setPointerCapture?.(e.pointerId);
                    }
                    catch {
                        /* synthetic */
                    }
                }
                const dt = Math.max(1, e.timeStamp - drag.t);
                drag.v = drag.v * 0.35 + (-((e.clientX - drag.last) / dt) * 1000) * 0.65;
                drag.last = e.clientX;
                drag.t = e.timeStamp;
                x = drag.from - (e.clientX - drag.x0);
                place();
            });
            const end = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const d = drag;
                drag = null;
                root.removeAttribute('data-dragging');
                if (d.live)
                    v = Math.max(-4e3, Math.min(4000, d.v));
            };
            this.listen(view, 'pointerup', end);
            this.listen(view, 'pointercancel', end);
            if (typeof ResizeObserver !== 'undefined') {
                const later = frameOnce(() => {
                    fill();
                    place();
                }, this);
                const ro = new ResizeObserver(() => later.ask());
                ro.observe(view);
                ro.observe(run);
                this.onCleanup(() => {
                    ro.disconnect();
                    later.cancel();
                });
            }
            this.onCleanup(() => {
                loop(false);
                root.remove();
                this._api = null;
            });
        }
    }, { id: 'fling-kit-19', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineFlingMarquee };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/fling-marquee.js.map