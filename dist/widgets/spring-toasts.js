import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { h as stackLayout } from '../chunks/spring-kit-17-B1KexqJR.js';
import { c as css } from '../chunks/spring-kit-17-2jh182UJ.js';

const SVG = 'http://www.w3.org/2000/svg';
const POSITIONS = ['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end'];
const TONES = ['info', 'success', 'error', 'warning'];
function defineSpringToasts(tag = 'usa-spring-toasts') {
    const ctor = defineElement(tag, (Base) => class SpringToasts extends Base {
        constructor() {
            super(...arguments);
            this._api = null;
            this._seq = 0;
        }
        static get observedAttributes() {
            return ['position', 'duration', 'max', 'label', 'feel', 'haptics'];
        }
        show(text, options = {}) {
            return this._api ? this._api.show(String(text ?? ''), options) : -1;
        }
        dismiss(id) {
            this._api?.dismiss(id, 'close');
        }
        clear() {
            this._api?.clear();
        }
        mount() {
            const pos = POSITIONS.includes(this.str('position')) ? this.str('position') : 'bottom-end';
            const bottom = pos.startsWith('bottom');
            const keep = Math.max(1, Math.min(10, Math.floor(this.num('max', 5))));
            const root = make('ol', 'usa-skit usa-stoasts');
            root.dataset.pos = pos;
            root.setAttribute('aria-label', this.str('label', 'Notifications'));
            root.tabIndex = -1;
            const polite = make('div', 'usa-skit-sr');
            polite.setAttribute('aria-live', 'polite');
            const loud = make('div', 'usa-skit-sr');
            loud.setAttribute('aria-live', 'assertive');
            this.append(root, polite, loud);
            let toasts = [];
            let expanded = false;
            const group = hostSprings(this, {}, (v) => {
                for (const t of toasts) {
                    const k = `t${t.id}`;
                    const y = v[`${k}y`] ?? 0;
                    const x = v[`${k}x`] ?? 0;
                    const s = v[`${k}s`] ?? 1;
                    const o = v[`${k}o`] ?? 1;
                    t.el.style.transform = `translate(${Math.round(x * 10) / 10}px, ${Math.round((bottom ? -y : y) * 10) / 10}px) scale(${Math.round(Math.max(0, s) * 1000) / 1000})`;
                    t.el.style.opacity = String(Math.round(Math.min(1, Math.max(0, o)) * 100) / 100);
                }
            }, {
                onRest: () => {
                    for (const t of [...toasts])
                        if (t.out && group.get(`t${t.id}o`) <= 0.01) {
                            t.el.remove();
                            toasts = toasts.filter((x) => x !== t);
                        }
                },
            });
            const live = () => toasts.filter((t) => !t.out);
            const layout = () => {
                const list = live();
                const heights = list.map((t) => t.el.getBoundingClientRect().height || 56);
                list.forEach((t, i) => {
                    const L = stackLayout(i, heights, expanded);
                    t.el.style.zIndex = String(100 - i);
                    t.el.toggleAttribute('inert', !expanded && i > 0);
                    group.set({ [`t${t.id}y`]: L.y, [`t${t.id}s`]: L.scale, [`t${t.id}o`]: L.opacity }, { spring: 'settle' });
                });
            };
            const arm = (t) => {
                clearTimeout(t.timer);
                if (t.left > 0 && !expanded) {
                    t.started = Date.now();
                    t.timer = setTimeout(() => dismiss(t.id, 'timeout'), t.left);
                }
            };
            const pause = (on) => {
                if (expanded === on)
                    return;
                expanded = on;
                for (const t of live()) {
                    if (on && t.timer) {
                        clearTimeout(t.timer);
                        t.timer = undefined;
                        t.left = Math.max(400, t.left - (Date.now() - t.started));
                    }
                    else if (!on)
                        arm(t);
                }
                layout();
            };
            const dismiss = (id, reason, fling = 0) => {
                const t = toasts.find((x) => x.id === id && !x.out);
                if (!t)
                    return;
                t.out = true;
                clearTimeout(t.timer);
                t.el.setAttribute('aria-hidden', 'true');
                t.el.setAttribute('inert', '');
                const k = `t${t.id}`;
                if (fling)
                    group.set({ [`${k}x`]: Math.sign(fling) * 420, [`${k}o`]: 0 }, { spring: 'snappy', velocity: { [`${k}x`]: fling } });
                else
                    group.set({ [`${k}s`]: 0.86, [`${k}o`]: 0 }, { spring: 'snappy' });
                if (!group.animating) {
                    t.el.remove();
                    toasts = toasts.filter((x) => x !== t);
                }
                this.emit('dismiss', { id, reason });
                layout();
                if (!live().length)
                    pause(false);
            };
            const show = (text, o) => {
                const id = ++this._seq;
                const tone = TONES.includes(o.tone ?? '') ? o.tone : 'info';
                const el = make('li', 'usa-stoasts-item');
                el.dataset.tone = tone;
                const dot = make('span', 'usa-stoasts-dot');
                dot.setAttribute('aria-hidden', 'true');
                const x = make('button', 'usa-stoasts-x');
                x.type = 'button';
                x.setAttribute('aria-label', 'Dismiss');
                const svg = document.createElementNS(SVG, 'svg');
                svg.setAttribute('viewBox', '0 0 12 12');
                svg.setAttribute('aria-hidden', 'true');
                const p = document.createElementNS(SVG, 'path');
                p.setAttribute('d', 'M2 2l8 8M10 2l-8 8');
                svg.append(p);
                x.append(svg);
                el.append(dot, make('span', 'usa-stoasts-text', text), x);
                root.prepend(el);
                const duration = o.duration ?? this.num('duration', 4000);
                const t = { id, el, tone, left: Math.max(0, duration), started: Date.now(), out: false };
                toasts.unshift(t);
                const k = `t${id}`;
                group.jump({ [`${k}y`]: -24, [`${k}x`]: 0, [`${k}s`]: 0.9, [`${k}o`]: 0 });
                (tone === 'error' ? loud : polite).textContent = text;
                tick(this, tone === 'error' ? [10, 40, 10] : 6);
                const extra = live().slice(keep);
                extra.forEach((e) => dismiss(e.id, 'overflow'));
                group.set({ [`${k}y`]: 0, [`${k}s`]: 1, [`${k}o`]: 1 }, { spring: 'bouncy' });
                layout();
                arm(t);
                this.emit('show', { id, text, tone });
                return id;
            };
            this._api = {
                show,
                dismiss,
                clear: () => live().forEach((t) => dismiss(t.id, 'clear')),
            };
            this.listen(root, 'click', (e) => {
                const x = e.target.closest?.('.usa-stoasts-x');
                if (!x)
                    return;
                const t = toasts.find((z) => z.el.contains(x));
                if (t)
                    dismiss(t.id, 'close');
            });
            this.listen(root, 'pointerenter', () => pause(true));
            this.listen(root, 'pointerleave', () => !root.contains(document.activeElement) && pause(false));
            this.listen(root, 'focusin', () => pause(true));
            this.listen(root, 'focusout', (e) => !root.contains(e.relatedTarget) && pause(false));
            this.listen(root, 'keydown', (e) => {
                if (e.key !== 'Escape')
                    return;
                const t = toasts.find((z) => !z.out && z.el.contains(e.target));
                if (t) {
                    e.preventDefault();
                    dismiss(t.id, 'close');
                }
            });
            // swipe a toast sideways to dismiss it
            let drag = null;
            this.listen(root, 'pointerdown', (e) => {
                const li = e.target.closest?.('.usa-stoasts-item');
                if (!li || e.target.closest?.('button') || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                const t = toasts.find((z) => z.el === li && !z.out);
                if (!t)
                    return;
                drag = { id: t.id, pid: e.pointerId, x0: e.clientX, last: e.clientX, t: e.timeStamp, v: 0 };
                try {
                    root.setPointerCapture?.(e.pointerId);
                }
                catch {
                    /* synthetic */
                }
            });
            this.listen(root, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.pid)
                    return;
                const dt = Math.max(1, e.timeStamp - drag.t);
                drag.v = ((e.clientX - drag.last) / dt) * 1000;
                drag.last = e.clientX;
                drag.t = e.timeStamp;
                const dx = e.clientX - drag.x0;
                group.jump({ [`t${drag.id}x`]: dx, [`t${drag.id}o`]: Math.max(0.2, 1 - Math.abs(dx) / 260) });
            });
            const end = (e) => {
                if (!drag || e.pointerId !== drag.pid)
                    return;
                const d = drag;
                drag = null;
                const dx = e.clientX - d.x0;
                if (Math.abs(dx) > 90 || Math.abs(d.v) > 700)
                    dismiss(d.id, 'swipe', d.v || Math.sign(dx) * 900);
                else
                    group.set({ [`t${d.id}x`]: 0, [`t${d.id}o`]: 1 }, { spring: 'elastic' });
            };
            this.listen(root, 'pointerup', end);
            this.listen(root, 'pointercancel', end);
            this.onCleanup(() => {
                for (const t of toasts)
                    clearTimeout(t.timer);
                toasts = [];
                group.stop();
                root.remove();
                polite.remove();
                loud.remove();
                this._api = null;
            });
        }
    }, { id: 'spring-kit-17', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSpringToasts };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/spring-toasts.js.map