import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { o as ownChildren } from './kit-DugHPVcq.js';
import { c as css } from './parts-kit-O_H_tVRs.js';

/**
 * The pose of a card `offset` places behind the front card (0 = front, negative = already passed) in a stack that shows
 * `visible` cards: lift (px, negative = up), scale, opacity and stacking order.
 */
function stackPose(offset, visible = 3) {
    const v = Math.max(1, Math.round(visible));
    if (offset < 0)
        return { y: 0, scale: 1, opacity: 0, z: 0 };
    const k = Math.min(offset, v);
    return { y: -k * 14, scale: Math.round((1 - k * 0.06) * 1000) / 1000, opacity: offset >= v ? 0 : 1 - k * 0.18, z: 100 - Math.round(offset) };
}
function defineStackSlider(tag = 'usa-stack-slider') {
    const ctor = defineElement(tag, Base => class StackSlider extends Base {
        constructor() {
            super(...arguments);
            this._count = 0;
        }
        static get observedAttributes() { return ['index', 'visible', 'loop', 'label', 'prev-label', 'next-label']; }
        get index() { return Math.max(0, Math.min(Math.max(0, this._count - 1), Math.round(this.num('index', 0)))); }
        set index(i) { this.setAttribute('index', String(Math.round(Number(i)) || 0)); }
        next() { this.go(1); }
        prev() { this.go(-1); }
        go(d) {
            const n = this._count;
            if (!n)
                return;
            let i = this.index + d;
            if (this.flag('loop'))
                i = (i + n) % n;
            if (i < 0 || i >= n || i === this.index)
                return;
            this.index = i;
            this.emit('change', { index: i });
        }
        changed(name) { if (name === 'index')
            this._sync?.();
        else
            super.changed(name); }
        mount() {
            const kids = ownChildren(this);
            this._count = kids.length;
            const visible = Math.min(5, Math.max(1, Math.round(this.num('visible', 3))));
            const root = make('div', 'usa-kit usa-stack');
            root.setAttribute('role', 'region');
            root.setAttribute('aria-roledescription', 'carousel');
            root.setAttribute('aria-label', this.str('label', 'Cards'));
            root.tabIndex = 0;
            const deck = make('div', 'usa-stack-deck');
            deck.style.setProperty('--visible', String(visible));
            const cards = kids.map((k, i) => {
                const c = make('div', 'usa-stack-card');
                c.setAttribute('role', 'group');
                c.setAttribute('aria-roledescription', 'slide');
                c.setAttribute('aria-label', `${i + 1} / ${kids.length}`);
                c.append(k);
                deck.append(c);
                return c;
            });
            const nav = make('div', 'usa-stack-nav');
            const prev = make('button', 'usa-stack-btn', '‹');
            prev.type = 'button';
            prev.setAttribute('aria-label', this.str('prev-label', 'Previous'));
            const count = make('span', 'usa-stack-count');
            count.setAttribute('aria-live', 'polite');
            const next = make('button', 'usa-stack-btn', '›');
            next.type = 'button';
            next.setAttribute('aria-label', this.str('next-label', 'Next'));
            nav.append(prev, count, next);
            root.append(deck, nav);
            this.append(root);
            let out = 1;
            const sync = () => {
                const at = this.index, n = cards.length;
                root.toggleAttribute('data-static', this.reduced);
                cards.forEach((c, i) => {
                    let off = i - at;
                    if (this.flag('loop') && n > visible + 1 && off < -1)
                        off += n;
                    const pose = stackPose(off, visible);
                    const gone = off < 0;
                    c.style.setProperty('--sy', `${pose.y}px`);
                    c.style.setProperty('--sx', gone ? `${out * 115}%` : '0px');
                    c.style.setProperty('--sr', gone ? `${out * 14}deg` : '0deg');
                    c.style.setProperty('--ss', String(pose.scale));
                    c.style.setProperty('--so', String(gone ? 0 : pose.opacity));
                    c.style.setProperty('--sz', String(gone ? 101 : pose.z));
                    c.inert = off !== 0;
                    c.setAttribute('aria-hidden', String(off !== 0));
                });
                count.textContent = n ? `${at + 1} / ${n}` : '';
                const loop = this.flag('loop');
                prev.disabled = !loop && at <= 0;
                next.disabled = !loop && at >= n - 1;
            };
            this._sync = sync;
            this.listen(prev, 'click', () => { out = 1; this.prev(); });
            this.listen(next, 'click', () => { out = -1; this.next(); });
            this.listen(root, 'keydown', (e) => {
                if (e.target !== root)
                    return;
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    out = -1;
                    this.next();
                }
                else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    out = 1;
                    this.prev();
                }
            });
            let drag = null;
            this.listen(deck, 'pointerdown', (e) => {
                const card = cards[this.index];
                if (!card || !card.contains(e.target) || e.target.closest('a, button, input, select, textarea'))
                    return;
                drag = { id: e.pointerId, x: e.clientX, card };
                card.setPointerCapture?.(e.pointerId);
                card.setAttribute('data-drag', '');
            });
            this.listen(deck, 'pointermove', (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const dx = e.clientX - drag.x;
                drag.card.style.setProperty('--sx', `${dx}px`);
                drag.card.style.setProperty('--sr', `${dx / 20}deg`);
            });
            const drop = (e) => {
                if (!drag || e.pointerId !== drag.id)
                    return;
                const dx = e.clientX - drag.x;
                drag.card.removeAttribute('data-drag');
                drag = null;
                if (Math.abs(dx) > 70) {
                    out = dx < 0 ? -1 : 1;
                    const before = this.index;
                    this.next();
                    if (this.index === before)
                        sync();
                }
                else
                    sync();
            };
            this.listen(deck, 'pointerup', drop);
            this.listen(deck, 'pointercancel', drop);
            this.onCleanup(() => {
                this.append(...kids);
                root.remove();
                this._sync = undefined;
            });
            sync();
        }
    }, { id: 'parts-kit', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineStackSlider as d, stackPose as s };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/stack-slider-FQaCv86d.js.map