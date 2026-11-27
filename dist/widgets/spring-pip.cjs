'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var microKit16 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var dampedKit18 = require('../chunks/damped-kit-18-CM0mPVmn.cjs');
var flingKit19$1 = require('../chunks/fling-kit-19-C9zMxm76.cjs');
var flingKit19 = require('../chunks/fling-kit-19-Cojn_2Zy.cjs');

function defineSpringPip(tag = 'usa-spring-pip') {
    const ctor = base.defineElement(tag, (Base) => class SpringPip extends Base {
        constructor() {
            super(...arguments);
            this._corner = 'bottom-right';
            this._source = null;
            this._go = null;
        }
        static get observedAttributes() {
            return ['corner', 'inset', 'label', 'feel', 'haptics'];
        }
        get corner() {
            return this._corner;
        }
        set corner(v) {
            const c = flingKit19$1.parseCorner(v);
            if (this._go)
                this._go(c, false);
            else
                this._corner = c;
        }
        mount() {
            if (!this._source) {
                const nodes = [...this.childNodes];
                const isWin = (n) => n.nodeType === 1 && n.hasAttribute('data-pip');
                this._source = { win: nodes.filter(isWin), page: nodes.filter((n) => !isWin(n)) };
                nodes.forEach((n) => n.parentNode === this && this.removeChild(n));
            }
            const attr = this.getAttribute('corner');
            if (attr !== this._seen) {
                this._seen = attr;
                this._corner = flingKit19$1.parseCorner(attr);
            }
            const inset = Math.max(0, this.num('inset', 12));
            const root = moments.make('div', 'usa-fkit usa-pip');
            const page = moments.make('div', 'usa-pip-page');
            page.append(...this._source.page.map((n) => n.cloneNode(true)));
            const win = moments.make('div', 'usa-pip-win');
            win.tabIndex = 0;
            win.setAttribute('role', 'group');
            win.setAttribute('aria-roledescription', 'floating window');
            win.setAttribute('aria-label', this.str('label', 'Floating window'));
            win.append(...this._source.win.map((n) => n.cloneNode(true)));
            root.append(page, win);
            this.append(root);
            const size = () => ({ fw: root.clientWidth || 320, fh: root.clientHeight || 300, w: win.offsetWidth || 160, h: win.offsetHeight || 100 });
            let box = size();
            const group = microKit16.hostSprings(this, { x: 0, y: 0, s: 1 }, (v) => {
                win.style.transform = `translate(${Math.round(v.x * 10) / 10}px, ${Math.round(v.y * 10) / 10}px) scale(${Math.round(v.s * 1000) / 1000})`;
            });
            const go = (c, user, velocity) => {
                const changed = c !== this._corner;
                this._corner = c;
                win.dataset.corner = c;
                box = size();
                const p = flingKit19$1.cornerPoint(c, box.w, box.h, box.fw, box.fh, inset);
                group.set({ x: p.x, y: p.y, s: 1 }, { spring: { duration: 560, bounce: 0.2 }, velocity: velocity ? { x: velocity.x, y: velocity.y } : undefined });
                if (changed) {
                    if (user)
                        microKit16.tick(this, 8);
                    this.emit('corner', { corner: c });
                }
            };
            this._go = go;
            win.dataset.corner = this._corner;
            const home = flingKit19$1.cornerPoint(this._corner, box.w, box.h, box.fw, box.fh, inset);
            group.jump(home);
            this.listen(win, 'keydown', (e) => {
                if (!/^Arrow(Up|Down|Left|Right)$/.test(e.key))
                    return;
                e.preventDefault();
                go(flingKit19$1.cornerStep(this._corner, e.key), true);
            });
            let drag = null;
            this.listen(win, 'pointerdown', (e) => {
                if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest?.('a, button, input, textarea, select, [contenteditable]'))
                    return;
                box = size();
                const r = root.getBoundingClientRect();
                drag = { id: e.pointerId, dx: e.clientX - r.left - group.get('x'), dy: e.clientY - r.top - group.get('y'), x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, t: e.timeStamp, vx: 0, vy: 0, live: false };
            });
            this.listen(win, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                if (!drag.live) {
                    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 4)
                        return;
                    drag.live = true;
                    root.setAttribute('data-dragging', '');
                    group.set({ s: 1.04 }, { spring: 'snappy' });
                    try {
                        win.setPointerCapture?.(e.pointerId);
                    }
                    catch {
                        /* synthetic */
                    }
                }
                const dt = Math.max(1, e.timeStamp - drag.t);
                // a light low-pass on the release speed, so one late event does not decide the corner
                drag.vx = drag.vx * 0.4 + (((e.clientX - drag.lx) / dt) * 1000) * 0.6;
                drag.vy = drag.vy * 0.4 + (((e.clientY - drag.ly) / dt) * 1000) * 0.6;
                drag.lx = e.clientX;
                drag.ly = e.clientY;
                drag.t = e.timeStamp;
                const r = root.getBoundingClientRect();
                const x = dampedKit18.dampedAt(e.clientX - r.left - drag.dx, inset, Math.max(inset, box.fw - box.w - inset), box.fw / 2);
                const y = dampedKit18.dampedAt(e.clientY - r.top - drag.dy, inset, Math.max(inset, box.fh - box.h - inset), box.fh / 2);
                group.jump({ x, y });
            });
            const end = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const d = drag;
                drag = null;
                root.removeAttribute('data-dragging');
                if (!d.live)
                    return;
                const c = flingKit19$1.pipCorner(group.get('x'), group.get('y'), d.vx, d.vy, box.w, box.h, box.fw, box.fh);
                go(c, true, { x: d.vx, y: d.vy });
            };
            this.listen(win, 'pointerup', end);
            this.listen(win, 'pointercancel', end);
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => {
                    if (drag)
                        return;
                    box = size();
                    if (!group.animating)
                        group.jump(flingKit19$1.cornerPoint(this._corner, box.w, box.h, box.fw, box.fh, inset));
                });
                ro.observe(root);
                ro.observe(win);
                this.onCleanup(() => ro.disconnect());
            }
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._go = null;
            });
        }
    }, { id: 'fling-kit-19', text: flingKit19.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSpringPip = defineSpringPip;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/spring-pip.cjs.map