import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { g as slotAt, s as shiftFor, m as moveItem } from '../chunks/spring-kit-17-B1KexqJR.js';
import { c as css } from '../chunks/spring-kit-17-2jh182UJ.js';

const SVG = 'http://www.w3.org/2000/svg';
function defineSpringList(tag = 'usa-spring-list') {
    const ctor = defineElement(tag, (Base) => class SpringList extends Base {
        constructor() {
            super(...arguments);
            this._order = [];
            this._source = null;
            this._move = null;
        }
        static get observedAttributes() {
            return ['items', 'label', 'gap', 'disabled', 'feel', 'haptics'];
        }
        get order() {
            return this._order.slice();
        }
        move(from, to) {
            this._move?.(from, to, false);
        }
        mount() {
            // the light-DOM children are the items; keep them across remounts
            if (!this._source) {
                const kids = [...this.children].filter((c) => !c.classList.contains('usa-slist'));
                this._source = kids.map((k) => [...k.childNodes]);
                kids.forEach((k) => k.remove());
            }
            const named = this.str('items') ? this.str('items').split('|').map((s) => s.trim()).filter(Boolean) : null;
            const contents = named ?? this._source;
            if (this._order.length !== contents.length)
                this._order = contents.map((_, i) => i);
            const disabled = this.flag('disabled');
            const gap = Math.max(0, this.num('gap', 8));
            const root = make('ul', 'usa-skit usa-slist');
            root.style.setProperty('--gap', `${gap}px`);
            root.setAttribute('aria-label', this.str('label', 'Reorder list'));
            root.toggleAttribute('data-disabled', disabled);
            const live = make('span', 'usa-skit-sr');
            live.setAttribute('aria-live', 'assertive');
            const items = contents.map((c, i) => {
                const li = make('li', 'usa-slist-item');
                const handle = make('button', 'usa-slist-handle');
                handle.type = 'button';
                handle.disabled = disabled;
                const svg = document.createElementNS(SVG, 'svg');
                svg.setAttribute('viewBox', '0 0 14 18');
                svg.setAttribute('aria-hidden', 'true');
                for (const [x, y] of [[4, 3], [10, 3], [4, 9], [10, 9], [4, 15], [10, 15]]) {
                    const d = document.createElementNS(SVG, 'circle');
                    d.setAttribute('cx', String(x));
                    d.setAttribute('cy', String(y));
                    d.setAttribute('r', '1.6');
                    svg.append(d);
                }
                handle.append(svg);
                const text = make('div', 'usa-slist-text');
                if (typeof c === 'string')
                    text.textContent = c;
                else
                    text.append(...c.map((n) => n.cloneNode(true)));
                li.append(handle, text);
                return { li, handle, name: (text.textContent || `Item ${i + 1}`).trim(), index: i };
            });
            const paintOrder = () => {
                this._order.forEach((orig, pos) => {
                    const it = items[orig];
                    root.append(it.li);
                    it.handle.setAttribute('aria-label', `Move ${it.name}, position ${pos + 1} of ${items.length}`);
                });
            };
            paintOrder();
            this.append(root, live);
            const init = { lift: 0, tilt: 0 };
            items.forEach((_, i) => (init[`y${i}`] = 0));
            let active = -1;
            const group = hostSprings(this, init, (v) => {
                items.forEach((it, i) => {
                    const y = v[`y${i}`];
                    const me = i === active;
                    const s = me ? 1 + Math.max(0, v.lift) * 0.03 : 1;
                    const r = me ? Math.max(-4, Math.min(4, v.tilt)) : 0;
                    it.li.style.transform = Math.abs(y) < 0.05 && s === 1 && !r ? '' : `translateY(${Math.round(y * 10) / 10}px) scale(${Math.round(s * 1000) / 1000}) rotate(${Math.round(r * 10) / 10}deg)`;
                });
            });
            const rows = () => this._order.map((o) => items[o].li.getBoundingClientRect());
            const say = (it, pos, what) => (live.textContent = `${it.name} ${what}, position ${pos + 1} of ${items.length}`);
            // FLIP: move in the DOM, then spring every item from where it stood (layout top + its current offset)
            const reflow = (from, to) => {
                const was = items.map((it, i) => it.li.offsetTop + group.get(`y${i}`));
                this._order = moveItem(this._order, from, to);
                paintOrder();
                items.forEach((it, i) => {
                    const d = was[i] - it.li.offsetTop;
                    if (Math.abs(d) > 0.5)
                        group.jump({ [`y${i}`]: d });
                    group.set({ [`y${i}`]: 0 }, { spring: 'settle' });
                });
            };
            const commit = (from, to, user) => {
                if (from === to)
                    return;
                reflow(from, to);
                this.emit('reorder', { from, to, order: this._order.slice() });
                if (user)
                    tick(this, 6);
            };
            this._move = (from, to, user) => {
                const n = this._order.length;
                if (!(from >= 0 && from < n && to >= 0 && to < n))
                    return;
                commit(from, to, user);
            };
            // pointer drag
            let drag = null;
            const restOthers = (pos, slot, size) => {
                this._order.forEach((orig, p) => {
                    if (orig === this._order[pos])
                        return;
                    group.set({ [`y${orig}`]: shiftFor(p, pos, slot, size) }, { spring: 'drag' });
                });
            };
            this.listen(root, 'pointerdown', (e) => {
                const h = e.target.closest?.('.usa-slist-handle');
                if (!h || disabled || (e.pointerType === 'mouse' && e.button !== 0))
                    return;
                const pos = this._order.findIndex((o) => items[o].handle === h);
                if (pos < 0)
                    return;
                e.preventDefault();
                const r = rows();
                const it = items[this._order[pos]];
                active = it.index;
                drag = { id: e.pointerId, pos, slot: pos, start: e.clientY, size: r[pos].height + gap, last: e.clientY, t: e.timeStamp, tops: r.map((x) => x.top), heights: r.map((x) => x.height) };
                try {
                    root.setPointerCapture?.(e.pointerId);
                }
                catch {
                    /* synthetic */
                }
                it.li.setAttribute('data-drag', '');
                group.set({ lift: 1 }, { spring: 'pop' });
                tick(this, 6);
            });
            this.listen(root, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const dy = e.clientY - drag.start;
                const dt = Math.max(1, e.timeStamp - drag.t);
                const speed = ((e.clientY - drag.last) / dt) * 1000;
                drag.last = e.clientY;
                drag.t = e.timeStamp;
                group.jump({ [`y${active}`]: dy });
                group.set({ tilt: Math.max(-4, Math.min(4, speed / 300)) }, { spring: 'drag' });
                const centre = drag.tops[drag.pos] + drag.heights[drag.pos] / 2 + dy;
                const slot = slotAt(centre, drag.tops, drag.heights);
                if (slot !== drag.slot) {
                    drag.slot = slot;
                    restOthers(drag.pos, slot, drag.size);
                    tick(this, 3);
                }
            });
            const drop = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const { pos, slot } = drag;
                drag = null;
                const it = items[active];
                it.li.removeAttribute('data-drag');
                group.set({ lift: 0, tilt: 0 }, { spring: 'settle' });
                if (slot !== pos) {
                    reflow(pos, slot);
                    say(it, slot, 'dropped');
                    this.emit('reorder', { from: pos, to: slot, order: this._order.slice() });
                }
                else
                    group.set({ [`y${active}`]: 0 }, { spring: 'settle' });
                it.handle.focus({ preventScroll: true });
            };
            this.listen(root, 'pointerup', drop);
            this.listen(root, 'pointercancel', drop);
            // keyboard: pick up, move, drop
            let grabbed = null;
            this.listen(root, 'keydown', (e) => {
                const h = e.target.closest?.('.usa-slist-handle');
                if (!h || disabled)
                    return;
                const pos = this._order.findIndex((o) => items[o].handle === h);
                const it = items[this._order[pos]];
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    if (!grabbed) {
                        grabbed = { from: pos, pos };
                        active = it.index;
                        it.li.setAttribute('data-grabbed', '');
                        group.set({ lift: 1 }, { spring: 'pop' });
                        say(it, pos, 'picked up. Use the arrow keys to move, Space to drop, Escape to cancel');
                    }
                    else {
                        it.li.removeAttribute('data-grabbed');
                        group.set({ lift: 0 }, { spring: 'settle' });
                        say(it, pos, 'dropped');
                        grabbed = null;
                    }
                    return;
                }
                if (!grabbed)
                    return;
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const to = pos + (e.key === 'ArrowUp' ? -1 : 1);
                    if (to < 0 || to >= this._order.length) {
                        group.impulse({ [`y${it.index}`]: (to < 0 ? -1 : 1) * 260 }, 'elastic');
                        return;
                    }
                    commit(pos, to, true);
                    grabbed.pos = to;
                    it.handle.focus({ preventScroll: true });
                    say(it, to, 'moved');
                }
                else if (e.key === 'Escape') {
                    e.preventDefault();
                    const back = grabbed.from;
                    grabbed = null;
                    it.li.removeAttribute('data-grabbed');
                    group.set({ lift: 0 }, { spring: 'settle' });
                    commit(pos, back, true);
                    it.handle.focus({ preventScroll: true });
                    say(it, back, 'returned');
                }
            });
            this.listen(root, 'focusout', (e) => {
                if (!grabbed || root.contains(e.relatedTarget))
                    return;
                // moving the focused item in the DOM can blur it for a moment; drop only if focus really left the list
                queueMicrotask(() => {
                    if (!grabbed || root.contains(this.ownerDocument.activeElement))
                        return;
                    items.forEach((x) => x.li.removeAttribute('data-grabbed'));
                    group.set({ lift: 0 }, { spring: 'settle' });
                    grabbed = null;
                });
            });
            this.onCleanup(() => {
                group.stop();
                root.remove();
                live.remove();
                this._move = null;
            });
        }
    }, { id: 'spring-kit-17', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSpringList };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/spring-list.js.map