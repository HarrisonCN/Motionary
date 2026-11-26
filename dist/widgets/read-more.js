import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { m as make } from '../chunks/moments-Cg_NlOYG.js';
import { u as uid, h as hostSprings, t as tick } from '../chunks/micro-kit-16-DrJflWG2.js';
import { l as linesHeight } from '../chunks/damped-kit-18-ykWuNSDE.js';
import { c as css } from '../chunks/damped-kit-18-C7vHGyLt.js';

function defineReadMore(tag = 'usa-read-more') {
    const ctor = defineElement(tag, (Base) => class ReadMore extends Base {
        constructor() {
            super(...arguments);
            this._open = false;
            this._clamped = false;
            this._source = null;
            this._set = null;
        }
        static get observedAttributes() {
            return ['lines', 'more', 'less', 'open', 'feel'];
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
        get clamped() {
            return this._clamped;
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
            const lines = Math.max(1, Math.min(40, Math.floor(this.num('lines', 3))));
            const more = this.str('more', 'Read more');
            const less = this.str('less', 'Show less');
            const root = make('div', 'usa-dkit usa-rmore');
            const clip = make('div', 'usa-rmore-clip');
            clip.id = uid('usa-rmore');
            const text = make('div', 'usa-rmore-text');
            text.append(...this._source.map((n) => n.cloneNode(true)));
            const fade = make('div', 'usa-rmore-fade');
            fade.setAttribute('aria-hidden', 'true');
            clip.append(text, fade);
            const btn = make('button', 'usa-rmore-btn');
            btn.type = 'button';
            btn.setAttribute('aria-controls', clip.id);
            root.append(clip, btn);
            this.append(root);
            let closed = 0;
            let full = 0;
            const measure = () => {
                const lh = parseFloat(getComputedStyle(text).lineHeight) || (parseFloat(getComputedStyle(text).fontSize) || 16) * 1.5;
                closed = linesHeight(lines, lh);
                full = text.scrollHeight || text.getBoundingClientRect().height || full;
                this._clamped = full > closed + 2;
                btn.hidden = !this._clamped;
                root.toggleAttribute('data-clamped', this._clamped);
            };
            const group = hostSprings(this, { p: this._open ? 1 : 0 }, (v) => {
                const p = v.p;
                const resting = Math.abs(p - Math.round(p)) < 0.002 && Math.abs(group.velocity('p')) < 0.01;
                if (!this._clamped || (resting && Math.round(p) === 1))
                    clip.style.height = '';
                else
                    clip.style.height = `${Math.round((closed + Math.max(0, p) * (full - closed)) * 10) / 10}px`;
                fade.style.opacity = String(Math.round(Math.min(1, Math.max(0, 1 - p * 1.6)) * 100) / 100);
            });
            const paint = () => {
                btn.textContent = this._open ? less : more;
                btn.setAttribute('aria-expanded', String(this._open));
                root.toggleAttribute('data-open', this._open);
            };
            const set = (on, user) => {
                if (on === this._open)
                    return;
                measure();
                this._open = on;
                paint();
                group.set({ p: on ? 1 : 0 }, { spring: on ? { duration: 560, bounce: 0.14 } : { duration: 380, bounce: 0 } });
                if (user)
                    tick(this, 5);
                this.emit('toggle', { open: on });
            };
            this._set = set;
            measure();
            paint();
            group.jump({ p: this._open ? 1 : 0 });
            this.listen(btn, 'click', () => set(!this._open, true));
            if (typeof ResizeObserver !== 'undefined') {
                const ro = new ResizeObserver(() => {
                    measure();
                    if (!group.animating)
                        group.jump({ p: this._open ? 1 : 0 });
                });
                ro.observe(text);
                this.onCleanup(() => ro.disconnect());
            }
            this.onCleanup(() => {
                group.stop();
                root.remove();
                this._set = null;
            });
        }
    }, { id: 'damped-kit-18', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineReadMore };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/read-more.js.map