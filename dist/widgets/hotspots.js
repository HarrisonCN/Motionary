import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make, u as uniqueId } from '../chunks/moments-Cg_NlOYG.js';
import { o as ownChildren, d as dataNum } from '../chunks/kit-Dmjuhvd8.js';
import { c as css } from '../chunks/data-media-Dlw8-L0c.js';

function defineHotspots(tag = 'usa-hotspots') {
    const ctor = defineElement(tag, Base => class Hotspots extends Base {
        constructor() {
            super(...arguments);
            this._index = -1;
        }
        static get observedAttributes() { return ['pulse', 'label']; }
        get index() { return this._index; }
        open(index) { this._set?.(index); }
        close() { this._set?.(-1); }
        mount() {
            const kids = ownChildren(this);
            const pic = kids.find((k) => k.matches('img,picture'));
            const notes = kids.filter((k) => k !== pic && k.hasAttribute('data-x'));
            const root = make('div', 'usa-kit usa-hot');
            root.setAttribute('role', 'group');
            root.setAttribute('aria-label', this.str('label', 'Points of interest'));
            const pulse = ['loop', 'off'].includes(this.str('pulse')) ? this.str('pulse') : 'once';
            root.dataset.pulse = pulse;
            if (pic)
                root.append(pic);
            const spots = notes.map((note, i) => {
                const x = Math.min(100, Math.max(0, dataNum(note, 'x', 50)));
                const y = Math.min(100, Math.max(0, dataNum(note, 'y', 50)));
                const wrap = make('div', 'usa-hot-spot');
                wrap.style.left = `${x}%`;
                wrap.style.top = `${y}%`;
                wrap.style.setProperty('--i', String(i));
                const btn = make('button', 'usa-hot-dot');
                btn.type = 'button';
                const id = uniqueId('usa-hot');
                btn.setAttribute('aria-controls', id);
                btn.setAttribute('aria-expanded', 'false');
                const title = note.dataset.title || `Point ${i + 1}`;
                btn.append(make('span', 'usa-sr', title));
                const card = make('div', 'usa-hot-card');
                card.id = id;
                card.hidden = true;
                card.dataset.side = x > 60 ? 'left' : 'right';
                card.dataset.vside = y > 70 ? 'up' : 'down';
                if (note.dataset.title)
                    card.append(make('strong', 'usa-hot-title', note.dataset.title));
                const body = make('div', 'usa-hot-body');
                body.append(...Array.from(note.childNodes));
                card.append(body);
                wrap.append(btn, card);
                root.append(wrap);
                return { note, btn, card, body };
            });
            this.append(root);
            for (const n of notes)
                n.remove();
            root.toggleAttribute('data-static', this.reduced);
            const set = (i) => {
                const to = i >= 0 && i < spots.length ? i : -1;
                if (to === this._index)
                    return;
                const from = this._index;
                this._index = to;
                spots.forEach((s, k) => {
                    const on = k === to;
                    s.btn.setAttribute('aria-expanded', String(on));
                    s.btn.parentElement.toggleAttribute('data-open', on);
                    if (on) {
                        s.card.hidden = false;
                        this.motion(s.card, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.03)', offset: 0.7 }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
                    }
                    else
                        s.card.hidden = true;
                });
                if (to >= 0)
                    this.emit('open', { index: to });
                else if (from >= 0)
                    this.emit('close');
            };
            this._set = set;
            spots.forEach((s, i) => this.listen(s.btn, 'click', () => set(this._index === i ? -1 : i)));
            this.listen(root, 'keydown', (e) => {
                if (e.key === 'Escape' && this._index >= 0) {
                    const b = spots[this._index].btn;
                    set(-1);
                    b.focus();
                }
            });
            this.listen(document, 'pointerdown', (e) => { if (this._index >= 0 && !root.contains(e.target))
                set(-1); });
            let seen = false;
            this.inView((visible) => {
                root.toggleAttribute('data-offscreen', !visible);
                if (visible && !seen) {
                    seen = true;
                    root.setAttribute('data-in', '');
                }
            });
            this.onCleanup(() => {
                for (const s of spots) {
                    s.note.append(...Array.from(s.body.childNodes));
                }
                if (pic)
                    this.append(pic);
                this.append(...notes);
                root.remove();
                this._set = undefined;
                this._index = -1;
            });
        }
    }, { id: 'data-media', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineHotspots };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/hotspots.js.map