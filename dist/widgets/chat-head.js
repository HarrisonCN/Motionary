import { f as defineElement, C as srText } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { d as dampedAt } from '../chunks/damped-kit-18-ykWuNSDE.js';
import { h as frameOnce } from '../chunks/fling-kit-19-Q_8uCj02.js';
import { v as css, m as magnetPull, h as headRest } from '../chunks/snap-kit-20-0ruReijY.js';

function defineChatHead(tag = 'usa-chat-head') {
    const ctor = defineElement(tag, (Base) => class ChatHead extends Base {
        constructor() {
            super(...arguments);
            this._side = 'right';
            this._y = 0.25;
            this._gone = false;
            this._source = null;
            this._api = null;
        }
        static get observedAttributes() {
            return ['side', 'count', 'label', 'inset', 'feel', 'haptics'];
        }
        get side() {
            return this._side;
        }
        set side(v) {
            const s = String(v) === 'left' ? 'left' : 'right';
            if (this._api)
                this._api.dock(s, this._y, false);
            else
                this._side = s;
        }
        get dismissed() {
            return this._gone;
        }
        dismiss() {
            if (this._api)
                this._api.dismiss(false);
            else
                this._gone = true;
        }
        restore() {
            if (this._api)
                this._api.restore();
            else
                this._gone = false;
        }
        mount() {
            if (!this._source) {
                const nodes = [...this.childNodes];
                const isHead = (n) => n.nodeType === 1 && n.hasAttribute('data-head');
                this._source = { head: nodes.filter(isHead), page: nodes.filter((n) => !isHead(n)) };
                nodes.forEach((n) => n.parentNode === this && this.removeChild(n));
            }
            const attr = this.getAttribute('side');
            if (attr !== this._seen) {
                this._seen = attr;
                this._side = attr === 'left' ? 'left' : 'right';
            }
            const inset = Math.max(0, this.num('inset', 10));
            const count = Math.max(0, Math.floor(this.num('count', 0)));
            const name = this.str('label', 'Chat');
            const root = make('div', 'usa-snkit usa-chead');
            const page = make('div', 'usa-chead-page');
            page.append(...this._source.page.map((n) => n.cloneNode(true)));
            const shade = make('div', 'usa-chead-shade');
            const target = make('div', 'usa-chead-target', '×');
            target.setAttribute('aria-hidden', 'true');
            const btn = make('button', 'usa-chead-btn');
            btn.type = 'button';
            const face = make('span');
            if (this._source.head.length)
                face.append(...this._source.head.map((n) => n.cloneNode(true)));
            else
                face.textContent = name.slice(0, 1).toUpperCase();
            btn.append(face);
            if (count) {
                const badge = make('span', 'usa-chead-badge', count > 99 ? '99+' : String(count));
                badge.setAttribute('aria-hidden', 'true');
                btn.append(badge);
            }
            btn.setAttribute('aria-label', count ? `${name}, ${count} new` : name);
            btn.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown Delete');
            const status = srText('');
            status.setAttribute('role', 'status');
            root.append(page, shade, target, btn, status);
            this.append(root);
            const size = () => ({ fw: root.clientWidth || 320, fh: root.clientHeight || 320, s: btn.offsetWidth || 56 });
            let box = size();
            const spot = (side, y) => {
                const room = Math.max(0, box.fh - box.s - inset * 2);
                return { x: side === 'left' ? inset : Math.max(inset, box.fw - box.s - inset), y: inset + room * Math.min(1, Math.max(0, y)) };
            };
            const head = hostSprings(this, { x: 0, y: 0, s: this._gone ? 0 : 1 }, (v) => {
                btn.style.transform = `translate(${Math.round(v.x * 10) / 10}px, ${Math.round(v.y * 10) / 10}px) scale(${Math.round(Math.max(0, v.s) * 1000) / 1000})`;
            });
            // t: how far the close target has risen (0–1); k: its size as the head is drawn in
            const aim = hostSprings(this, { t: 0, k: 1 }, (v) => {
                const t = Math.max(0, v.t);
                target.style.opacity = String(Math.round(Math.min(1, t) * 1000) / 1000);
                target.style.transform = `translateY(${Math.round((1 - t) * 40 * 10) / 10}px) scale(${Math.round(v.k * 1000) / 1000})`;
                shade.style.opacity = String(Math.round(Math.min(1, t) * 1000) / 1000);
            });
            const targetCentre = () => ({ x: box.fw / 2, y: box.fh - 22 - 30 });
            const paint = () => {
                root.toggleAttribute('data-dismissed', this._gone);
                btn.toggleAttribute('inert', this._gone);
                btn.dataset.side = this._side;
            };
            const dock = (side, y, user, velocity) => {
                const changed = side !== this._side;
                this._side = side;
                this._y = Math.min(1, Math.max(0, y));
                box = size();
                const p = spot(side, this._y);
                head.set({ x: p.x, y: p.y, s: this._gone ? 0 : 1 }, { spring: { duration: 560, bounce: 0.22 }, velocity: velocity ? { x: velocity.x, y: velocity.y } : undefined });
                paint();
                if (changed || user)
                    this.emit('dock', { side });
                if (changed && user)
                    tick(this, 8);
            };
            const dismiss = (user) => {
                if (this._gone)
                    return;
                this._gone = true;
                box = size();
                const c = targetCentre();
                head.set({ x: c.x - box.s / 2, y: c.y - box.s / 2, s: 0 }, { spring: { duration: 380, bounce: 0 } });
                aim.set({ t: 0, k: 1 }, { spring: { duration: 420, bounce: 0 } });
                paint();
                status.textContent = `${name} closed.`;
                if (user)
                    tick(this, [12, 40, 12]);
                this.emit('dismiss', {});
            };
            const restore = () => {
                if (!this._gone)
                    return;
                this._gone = false;
                box = size();
                const p = spot(this._side, this._y);
                head.jump({ x: p.x, y: p.y, s: 0 });
                head.set({ s: 1 }, { spring: { duration: 520, bounce: 0.35 } });
                paint();
                status.textContent = `${name} is back.`;
                this.emit('restore', {});
            };
            this._api = { dock, dismiss, restore };
            paint();
            const home = spot(this._side, this._y);
            head.jump({ ...home, s: this._gone ? 0 : 1 });
            let moved = false;
            this.listen(btn, 'click', () => {
                if (moved) {
                    moved = false;
                    return;
                }
                if (!this._gone)
                    this.emit('tap', {});
            });
            this.listen(btn, 'keydown', (e) => {
                if (this._gone)
                    return;
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    dismiss(true);
                }
                else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    dock(e.key === 'ArrowLeft' ? 'left' : 'right', this._y, true);
                }
                else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    dock(this._side, this._y + (e.key === 'ArrowUp' ? -0.25 : 0.25), true);
                }
            });
            let drag = null;
            this.listen(btn, 'pointerdown', (e) => {
                if (this._gone || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                box = size();
                const r = root.getBoundingClientRect();
                moved = false;
                drag = { id: e.pointerId, dx: e.clientX - r.left - head.get('x'), dy: e.clientY - r.top - head.get('y'), x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, t: e.timeStamp, vx: 0, vy: 0, live: false, caught: false };
                // capture now: the head is small, so a quick first move would otherwise land outside it and never start the drag
                try {
                    btn.setPointerCapture?.(e.pointerId);
                }
                catch {
                    /* synthetic */
                }
            });
            this.listen(btn, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                if (!drag.live) {
                    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5)
                        return;
                    drag.live = true;
                    moved = true;
                    root.setAttribute('data-dragging', '');
                    head.set({ s: 1.08 }, { spring: 'snappy' });
                    aim.set({ t: 1 }, { spring: { duration: 420, bounce: 0.2 } });
                }
                const dt = Math.max(1, e.timeStamp - drag.t);
                drag.vx = drag.vx * 0.4 + (((e.clientX - drag.lx) / dt) * 1000) * 0.6;
                drag.vy = drag.vy * 0.4 + (((e.clientY - drag.ly) / dt) * 1000) * 0.6;
                drag.lx = e.clientX;
                drag.ly = e.clientY;
                drag.t = e.timeStamp;
                const r = root.getBoundingClientRect();
                const rawX = dampedAt(e.clientX - r.left - drag.dx, 0, Math.max(0, box.fw - box.s), box.fw / 3);
                const rawY = dampedAt(e.clientY - r.top - drag.dy, 0, Math.max(0, box.fh - box.s), box.fh / 3);
                const c = targetCentre();
                const pull = magnetPull(rawX + box.s / 2, rawY + box.s / 2, c.x, c.y, Math.max(70, box.s * 1.6));
                const caught = pull >= 0.45;
                if (caught !== drag.caught) {
                    drag.caught = caught;
                    aim.set({ k: caught ? 1.28 : 1 }, { spring: { duration: 320, bounce: 0.4 } });
                    if (caught)
                        tick(this, 12);
                }
                // the target draws the head in: a blend toward its centre that grows as the head gets closer
                const f = caught ? 1 : pull;
                head.jump({ x: rawX + (c.x - box.s / 2 - rawX) * f, y: rawY + (c.y - box.s / 2 - rawY) * f });
            });
            const end = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const d = drag;
                drag = null;
                root.removeAttribute('data-dragging');
                if (!d.live)
                    return;
                if (d.caught && e.type === 'pointerup')
                    return dismiss(true);
                aim.set({ t: 0, k: 1 }, { spring: { duration: 380, bounce: 0 } });
                const fresh = e.timeStamp - d.t < 90;
                const vx = fresh ? d.vx : 0;
                const vy = fresh ? d.vy : 0;
                const rest = headRest(head.get('x'), head.get('y'), vx, vy, box.s, box.fw, box.fh, inset);
                const room = Math.max(1, box.fh - box.s - inset * 2);
                dock(rest.side, (rest.y - inset) / room, true, { x: vx, y: vy });
            };
            this.listen(btn, 'pointerup', end);
            this.listen(btn, 'pointercancel', end);
            if (typeof ResizeObserver !== 'undefined') {
                const later = frameOnce(() => {
                    if (drag)
                        return;
                    box = size();
                    if (!head.animating && !this._gone)
                        head.jump(spot(this._side, this._y));
                }, this);
                const ro = new ResizeObserver(() => later.ask());
                ro.observe(root);
                this.onCleanup(() => {
                    ro.disconnect();
                    later.cancel();
                });
            }
            this.onCleanup(() => {
                head.stop();
                aim.stop();
                root.remove();
                this._api = null;
            });
        }
    }, { id: 'snap-kit-20', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineChatHead };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/chat-head.js.map