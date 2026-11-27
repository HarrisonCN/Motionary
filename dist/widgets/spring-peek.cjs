'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var moments = require('../chunks/moments-eoZA2npZ.cjs');
var microKit16 = require('../chunks/micro-kit-16-QpCvprq4.cjs');
var dampedKit18 = require('../chunks/damped-kit-18-CM0mPVmn.cjs');
var flingKit19 = require('../chunks/fling-kit-19-Cojn_2Zy.cjs');

function defineSpringPeek(tag = 'usa-spring-peek') {
    const ctor = base.defineElement(tag, (Base) => class SpringPeek extends Base {
        constructor() {
            super(...arguments);
            this._open = false;
            this._source = null;
            this._api = null;
        }
        static get observedAttributes() {
            return ['delay', 'label', 'close', 'feel', 'haptics'];
        }
        get open() {
            return this._open;
        }
        show() {
            this._api?.show();
        }
        close() {
            this._api?.close();
        }
        mount() {
            if (!this._source) {
                const nodes = [...this.childNodes];
                const isPeek = (n) => n.nodeType === 1 && n.hasAttribute('data-peek');
                this._source = { peek: nodes.filter(isPeek), card: nodes.filter((n) => !isPeek(n)) };
                nodes.forEach((n) => n.parentNode === this && this.removeChild(n));
            }
            this._open = false;
            const delay = Math.min(2000, Math.max(120, this.num('delay', 420)));
            const root = moments.make('div', 'usa-fkit usa-peek');
            const card = moments.make('div', 'usa-peek-card');
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-haspopup', 'dialog');
            card.setAttribute('aria-expanded', 'false');
            card.append(...this._source.card.map((n) => n.cloneNode(true)));
            const dialog = moments.make('dialog', 'usa-fkit usa-peek-dialog');
            dialog.id = microKit16.uid('usa-peek');
            dialog.setAttribute('aria-label', this.str('label', 'Preview'));
            card.setAttribute('aria-controls', dialog.id);
            const dim = moments.make('div', 'usa-peek-dim');
            const panel = moments.make('div', 'usa-peek-panel');
            panel.tabIndex = -1;
            panel.append(...this._source.peek.map((n) => n.cloneNode(true)));
            const shut = moments.make('button', 'usa-peek-close', this.str('close', 'Close'));
            shut.type = 'button';
            panel.append(shut);
            dialog.append(dim, panel);
            root.append(card, dialog);
            this.append(root);
            // where the panel grows from: the card's centre and size, relative to the panel at rest
            let from = { dx: 0, dy: 0, s: 0.6 };
            const group = microKit16.hostSprings(this, { p: 0, o: 0, y: 0 }, (v) => {
                card.style.transform = v.p ? `scale(${Math.round((1 - 0.05 * v.p) * 1000) / 1000})` : '';
                const k = 1 - v.o;
                const s = from.s + (1 - from.s) * v.o;
                panel.style.transform = `translate(-50%, -50%) translate(${Math.round(from.dx * k * 10) / 10}px, ${Math.round((from.dy * k + v.y) * 10) / 10}px) scale(${Math.round(Math.max(0.05, s) * 1000) / 1000})`;
                const fade = Math.min(1, Math.max(0, v.o));
                panel.style.opacity = String(Math.round(Math.min(1, fade * 1.8) * 1000) / 1000);
                dim.style.opacity = String(Math.round(fade * Math.max(0, 1 - Math.max(0, v.y) / 400) * 1000) / 1000);
            }, {
                onRest: () => {
                    if (!this._open && dialog.open)
                        finish();
                },
            });
            const finish = () => {
                if (typeof dialog.close === 'function')
                    dialog.close();
                else
                    dialog.removeAttribute('open');
            };
            const show = () => {
                if (this._open)
                    return;
                this._open = true;
                if (typeof dialog.showModal === 'function') {
                    try {
                        dialog.showModal();
                    }
                    catch {
                        dialog.setAttribute('open', '');
                    }
                }
                else
                    dialog.setAttribute('open', '');
                const c = card.getBoundingClientRect();
                const p = panel.getBoundingClientRect();
                from = p.width && c.width ? { dx: c.left + c.width / 2 - (p.left + p.width / 2), dy: c.top + c.height / 2 - (p.top + p.height / 2), s: Math.min(1, Math.max(0.2, c.width / p.width)) } : { dx: 0, dy: 0, s: 0.6 };
                card.setAttribute('aria-expanded', 'true');
                group.jump({ o: 0, y: 0 });
                group.set({ o: 1, p: 0 }, { spring: { duration: 560, bounce: 0.22 } });
                microKit16.tick(this, 12);
                panel.focus({ preventScroll: true });
                this.emit('toggle', { open: true });
            };
            const close = (velocity = 0) => {
                if (!this._open)
                    return;
                this._open = false;
                card.setAttribute('aria-expanded', 'false');
                group.set({ o: 0, y: 0 }, { spring: { duration: 420, bounce: 0.08 }, velocity: velocity ? { y: velocity } : undefined });
                if (this.reduced || !group.animating)
                    finish();
                card.focus({ preventScroll: true });
                this.emit('toggle', { open: false });
            };
            this._api = { show, close: () => close() };
            let timer = 0;
            let hold = null;
            const stopTimer = () => {
                if (timer)
                    clearTimeout(timer);
                timer = 0;
            };
            const release = () => {
                stopTimer();
                hold = null;
                if (!this._open)
                    group.set({ p: 0 }, { spring: { duration: 420, bounce: 0.4 } });
            };
            this.listen(card, 'pointerdown', (e) => {
                if ((e.pointerType === 'mouse' && e.button !== 0) || this._open)
                    return;
                hold = { id: e.pointerId, x: e.clientX, y: e.clientY, opened: false };
                group.set({ p: 1 }, { spring: { duration: delay, bounce: 0 } });
                stopTimer();
                timer = window.setTimeout(() => {
                    timer = 0;
                    if (!hold)
                        return;
                    hold.opened = true;
                    show();
                }, delay);
            });
            this.listen(card, 'pointermove', (e) => {
                if (!hold || e.pointerId !== hold.id)
                    return;
                if (!hold.opened) {
                    if (Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 8)
                        release();
                    return;
                }
                drag.move(e, hold.y);
            });
            const cardUp = (e) => {
                if (!hold || e.pointerId !== hold.id)
                    return;
                const h = hold;
                release();
                if (h.opened)
                    drag.end();
                else if (e.type === 'pointerup')
                    this.emit('tap', {});
            };
            this.listen(card, 'pointerup', cardUp);
            this.listen(card, 'pointercancel', cardUp);
            this.listen(card, 'contextmenu', (e) => {
                if (hold || this._open)
                    e.preventDefault();
            });
            this.listen(card, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
                    e.preventDefault();
                    show();
                }
            });
            // dragging the open preview: down follows, up resists; a pull or a flick down closes it
            const drag = {
                last: 0,
                t: 0,
                v: 0,
                y0: 0,
                move: (e, y0) => {
                    const dt = Math.max(1, e.timeStamp - drag.t);
                    drag.v = drag.t ? ((e.clientY - drag.last) / dt) * 1000 : 0;
                    drag.last = e.clientY;
                    drag.t = e.timeStamp;
                    group.jump({ y: dampedKit18.dampedAt(e.clientY - y0, 0, Infinity, 240) });
                },
                end: (_e) => {
                    const y = group.get('y');
                    const v = drag.v;
                    drag.t = 0;
                    if (y > 90 || v > 700)
                        close(v);
                    else
                        group.set({ y: 0 }, { spring: { duration: 460, bounce: 0.3 }, velocity: { y: v } });
                },
            };
            let pan = null;
            this.listen(panel, 'pointerdown', (e) => {
                if ((e.pointerType === 'mouse' && e.button !== 0) || e.target.closest?.('a, button, input, textarea, select, [contenteditable]'))
                    return;
                pan = { id: e.pointerId, y0: e.clientY - group.get('y') };
                drag.t = 0;
                try {
                    panel.setPointerCapture?.(e.pointerId);
                }
                catch {
                    /* synthetic */
                }
            });
            this.listen(panel, 'pointermove', (e) => {
                if (pan && e.pointerId === pan.id)
                    drag.move(e, pan.y0);
            });
            const panUp = (e) => {
                if (!pan || e.pointerId !== pan.id)
                    return;
                pan = null;
                drag.end();
            };
            this.listen(panel, 'pointerup', panUp);
            this.listen(panel, 'pointercancel', panUp);
            this.listen(dim, 'click', () => close());
            this.listen(shut, 'click', () => close());
            this.listen(dialog, 'cancel', (e) => {
                e.preventDefault();
                close();
            });
            this.listen(dialog, 'keydown', (e) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    close();
                }
            });
            this.onCleanup(() => {
                stopTimer();
                group.stop();
                if (dialog.open)
                    finish();
                root.remove();
                this._api = null;
                this._open = false;
            });
        }
    }, { id: 'fling-kit-19', text: flingKit19.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSpringPeek = defineSpringPeek;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/spring-peek.cjs.map