'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var microKit16 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var springKit17$1 = require('../chunks/spring-kit-17-Y1urAq72.cjs');
var springKit17 = require('../chunks/spring-kit-17-BzIkfNWk.cjs');

const SVG = 'http://www.w3.org/2000/svg';
const TONES = ['accent', 'danger', 'ok', 'neutral'];
function defineSpringSwipe(tag = 'usa-spring-swipe') {
    const ctor = base.defineElement(tag, (Base) => class SpringSwipe extends Base {
        constructor() {
            super(...arguments);
            this._open = false;
            this._source = null;
            this._set = null;
        }
        static get observedAttributes() {
            return ['actions', 'open', 'label', 'disabled', 'feel', 'haptics'];
        }
        get open() {
            return this._open;
        }
        set open(v) {
            if (this._set)
                this._set(!!v, false);
            else
                this._open = !!v;
        }
        mount() {
            if (!this._source) {
                this._source = [...this.childNodes];
                this._source.forEach((n) => n.parentNode === this && this.removeChild(n));
            }
            const attr = this.getAttribute('open');
            if (attr !== this._seen) {
                this._seen = attr;
                this._open = this.flag('open');
            }
            const disabled = this.flag('disabled');
            const defs = (this.str('actions') || 'Archive|Delete:danger').split('|').map((s) => s.trim()).filter(Boolean).slice(0, 4).map((s) => {
                const m = /^(.*?):(\w+)$/.exec(s);
                const tone = m && TONES.includes(m[2]) ? m[2] : 'accent';
                return { label: (m && TONES.includes(m[2]) ? m[1] : s).trim(), tone };
            });
            const root = moments.make('div', 'usa-skit usa-sswipe');
            root.toggleAttribute('data-disabled', disabled);
            const acts = moments.make('div', 'usa-sswipe-actions');
            const buttons = defs.map((d, i) => {
                const b = moments.make('button', 'usa-sswipe-act', d.label);
                b.type = 'button';
                b.dataset.tone = d.tone;
                b.dataset.index = String(i);
                acts.append(b);
                return b;
            });
            const row = moments.make('div', 'usa-sswipe-row');
            const body = moments.make('div', 'usa-sswipe-body');
            body.append(...this._source.map((n) => n.cloneNode(true)));
            const more = moments.make('button', 'usa-sswipe-more');
            more.type = 'button';
            more.disabled = disabled;
            more.setAttribute('aria-label', this.str('label', 'More actions'));
            const svg = document.createElementNS(SVG, 'svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('aria-hidden', 'true');
            for (const x of [5, 12, 19]) {
                const c = document.createElementNS(SVG, 'circle');
                c.setAttribute('cx', String(x));
                c.setAttribute('cy', '12');
                c.setAttribute('r', '2');
                svg.append(c);
            }
            more.append(svg);
            row.append(body, more);
            root.append(acts, row);
            this.append(root);
            const id = microKit16.uid('usa-sswipe');
            acts.id = id;
            more.setAttribute('aria-controls', id);
            const dir = typeof getComputedStyle === 'function' && getComputedStyle(this).direction === 'rtl' ? 1 : -1;
            let width = 0;
            const measure = () => (width = acts.getBoundingClientRect().width || width || defs.length * 80);
            const group = microKit16.hostSprings(this, { x: 0 }, (v) => {
                row.style.transform = Math.abs(v.x) < 0.05 ? '' : `translateX(${Math.round(v.x * dir * 10) / 10}px)`;
                const w = width || 1;
                buttons.forEach((b, i) => {
                    const share = Math.min(1, Math.max(0, v.x / w));
                    b.style.transform = `scale(${Math.round((0.7 + share * 0.3) * 1000) / 1000})`;
                    b.style.opacity = String(Math.round(Math.min(1, share * 1.4 - i * 0.1) * 100) / 100);
                });
            });
            const paint = () => {
                more.setAttribute('aria-expanded', String(this._open));
                acts.toggleAttribute('inert', !this._open);
                acts.setAttribute('aria-hidden', String(!this._open));
            };
            const set = (on, user, velocity = 0) => {
                measure();
                const changed = on !== this._open;
                this._open = on;
                paint();
                group.set({ x: on ? width : 0 }, { spring: on ? 'bouncy' : 'settle', velocity: velocity ? { x: velocity } : undefined });
                if (changed && user) {
                    microKit16.tick(this, 6);
                    this.emit('toggle', { open: on });
                }
            };
            this._set = set;
            paint();
            group.jump({ x: this._open ? measure() : 0 });
            let drag = null;
            this.listen(row, 'pointerdown', (e) => {
                if (disabled || (e.pointerType === 'mouse' && e.button !== 0) || e.target.closest?.('button'))
                    return;
                measure();
                drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, from: group.get('x'), last: e.clientX, t: e.timeStamp, v: 0, live: false };
            });
            this.listen(row, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const dx = (e.clientX - drag.x0) * dir;
                if (!drag.live) {
                    if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.y0))
                        return;
                    drag.live = true;
                    try {
                        row.setPointerCapture?.(e.pointerId);
                    }
                    catch {
                        /* synthetic */
                    }
                }
                const dt = Math.max(1, e.timeStamp - drag.t);
                drag.v = (((e.clientX - drag.last) * dir) / dt) * 1000;
                drag.last = e.clientX;
                drag.t = e.timeStamp;
                const raw = drag.from + dx;
                const inside = Math.min(width, Math.max(0, raw));
                group.jump({ x: inside + microKit16.overdrag(raw, 0, width, Math.max(60, width)) });
            });
            const end = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const d = drag;
                drag = null;
                if (!d.live)
                    return;
                set(springKit17$1.swipeOpen(group.get('x'), width, d.v), true, d.v);
            };
            this.listen(row, 'pointerup', end);
            this.listen(row, 'pointercancel', end);
            this.listen(more, 'click', () => {
                if (disabled)
                    return;
                set(!this._open, true);
                if (this._open)
                    buttons[0]?.focus({ preventScroll: true });
            });
            this.listen(acts, 'click', (e) => {
                const b = e.target.closest?.('.usa-sswipe-act');
                if (!b || !this._open)
                    return;
                const i = Number(b.dataset.index);
                this.emit('action', { index: i, label: defs[i].label });
                set(false, true);
                more.focus({ preventScroll: true });
            });
            this.listen(root, 'keydown', (e) => {
                if (e.key === 'Escape' && this._open) {
                    e.preventDefault();
                    set(false, true);
                    more.focus({ preventScroll: true });
                }
            });
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => {
                    measure();
                    if (this._open)
                        group.jump({ x: width });
                });
                ro.observe(acts);
                this.onCleanup(() => ro.disconnect());
            }
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._set = null;
            });
        }
    }, { id: 'spring-kit-17', text: springKit17.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSpringSwipe = defineSpringSwipe;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/spring-swipe.cjs.map