import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { o as ownChildren } from './kit-Dmjuhvd8.js';
import { c as css } from './data-media-Dlw8-L0c.js';

/** The resting pose of a card `offset` places from the active one: angle (deg), x (% of card width), y (px), scale. */
function fanPose(offset, spread) {
    const d = Math.max(-4, Math.min(4, offset));
    const a = Math.abs(d);
    return { angle: d * spread, x: d * 42, y: a * a * 6, scale: 1 - Math.min(0.24, a * 0.06), z: 100 - a };
}
function defineFanCarousel(tag = 'usa-fan-carousel') {
    const ctor = defineElement(tag, Base => class FanCarousel extends Base {
        constructor() {
            super(...arguments);
            this._count = 0;
        }
        static get observedAttributes() { return ['index', 'spread', 'loop', 'label']; }
        get index() {
            const n = this._count, raw = this.num('index', Math.floor((n - 1) / 2));
            return n ? Math.max(0, Math.min(n - 1, Math.round(raw))) : 0;
        }
        set index(i) { this.setAttribute('index', String(Math.round(Number(i)) || 0)); }
        go(i) {
            const n = this._count;
            if (!n)
                return;
            const to = this.flag('loop') ? ((i % n) + n) % n : Math.max(0, Math.min(n - 1, i));
            if (to === this.index)
                return;
            this.index = to;
            this.emit('change', { index: to });
        }
        next() { this.go(this.index + 1); }
        previous() { this.go(this.index - 1); }
        changed(name) { if (name === 'index' || name === 'spread' || name === 'loop')
            this._sync?.();
        else
            super.changed(name); }
        mount() {
            const cards = ownChildren(this);
            this._count = cards.length;
            const root = make('section', 'usa-kit usa-fan');
            root.setAttribute('aria-roledescription', 'carousel');
            const stage = make('div', 'usa-fan-stage');
            const slots = cards.map((c, i) => {
                const slot = make('div', 'usa-fan-card');
                slot.setAttribute('role', 'group');
                slot.setAttribute('aria-roledescription', 'slide');
                slot.setAttribute('aria-label', `${i + 1} of ${cards.length}`);
                slot.append(c);
                stage.append(slot);
                return slot;
            });
            const nav = make('div', 'usa-fan-nav');
            const mk = (cls, label) => { const b = make('button', `usa-fan-btn ${cls}`); b.type = 'button'; b.setAttribute('aria-label', label); return b; };
            const prev = mk('usa-fan-prev', 'Previous card');
            const next = mk('usa-fan-next', 'Next card');
            const status = make('p', 'usa-sr');
            status.setAttribute('aria-live', 'polite');
            nav.append(prev, next);
            root.append(stage, nav, status);
            this.append(root);
            let first = true;
            const sync = () => {
                const at = this.index, spread = Math.min(20, Math.max(3, this.num('spread', 9))), loop = this.flag('loop');
                root.setAttribute('aria-label', this.str('label', 'Cards'));
                root.toggleAttribute('data-static', this.reduced);
                slots.forEach((slot, i) => {
                    const p = fanPose(i - at, spread);
                    slot.style.setProperty('--a', `${p.angle}deg`);
                    slot.style.setProperty('--x', `${p.x}%`);
                    slot.style.setProperty('--y', `${p.y}px`);
                    slot.style.setProperty('--s', String(p.scale));
                    slot.style.zIndex = String(p.z);
                    const front = i === at;
                    slot.toggleAttribute('data-front', front);
                    slot.inert = !front;
                    slot.setAttribute('aria-hidden', String(!front));
                });
                prev.disabled = !loop && at <= 0;
                next.disabled = !loop && at >= slots.length - 1;
                if (!first)
                    status.textContent = `Card ${at + 1} of ${slots.length}`;
                first = false;
            };
            this._sync = sync;
            this.listen(prev, 'click', () => this.previous());
            this.listen(next, 'click', () => this.next());
            this.listen(stage, 'click', (e) => {
                if (swiped) {
                    swiped = false;
                    return;
                }
                const i = slots.findIndex((s) => s.contains(e.target));
                if (i >= 0 && i !== this.index)
                    this.go(i);
            });
            this.listen(root, 'keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    this.previous();
                    e.preventDefault();
                }
                else if (e.key === 'ArrowRight') {
                    this.next();
                    e.preventDefault();
                }
            });
            let sx = 0, sid = -1, swiped = false;
            this.listen(stage, 'pointerdown', (e) => { sx = e.clientX; sid = e.pointerId; swiped = false; });
            this.listen(stage, 'pointerup', (e) => {
                if (e.pointerId !== sid)
                    return;
                sid = -1;
                const dx = e.clientX - sx;
                swiped = Math.abs(dx) > 40;
                if (swiped)
                    (dx < 0 ? this.next() : this.previous());
            });
            this.onCleanup(() => {
                this.append(...cards);
                root.remove();
                this._sync = undefined;
            });
            sync();
        }
    }, { id: 'data-media', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineFanCarousel as d, fanPose as f };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/fan-carousel-Dfr62AcM.js.map