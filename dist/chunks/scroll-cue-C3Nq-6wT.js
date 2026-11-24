import { f as defineElement, I as queryAttr } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make } from './moments-Cg_NlOYG.js';
import { c as css } from './page-kit-CZKIJAq3.js';

const CUE_KINDS = ['mouse', 'chevron', 'line'];
function defineScrollCue(tag = 'usa-scroll-cue') {
    const ctor = defineElement(tag, Base => class ScrollCue extends Base {
        constructor() {
            super(...arguments);
            this._gone = false;
        }
        static get observedAttributes() { return ['kind', 'label', 'target', 'hide-after', 'text']; }
        get away() { return this._gone; }
        mount() {
            const kind = CUE_KINDS.includes(this.str('kind')) ? this.str('kind') : 'mouse';
            const btn = make('button', 'usa-kit usa-cue');
            btn.type = 'button';
            btn.setAttribute('aria-label', this.str('label', 'Scroll down'));
            const art = make('span', `usa-cue-${kind}`);
            art.setAttribute('aria-hidden', 'true');
            if (kind === 'chevron')
                art.append(make('i'), make('i'));
            btn.append(art);
            const caption = this.str('text');
            if (caption)
                btn.append(make('span', 'usa-cue-text', caption));
            this.append(btn);
            const after = Math.max(0, this.num('hide-after', 40));
            const check = () => {
                const gone = window.scrollY > after;
                if (gone === this._gone)
                    return;
                this._gone = gone;
                btn.toggleAttribute('data-hidden', gone);
                btn.tabIndex = gone ? -1 : 0;
                this.emit(gone ? 'hide' : 'show');
            };
            this.listen(window, 'scroll', check, { passive: true });
            this.listen(btn, 'click', () => {
                const target = queryAttr(this.str('target') || null);
                const behavior = this.reduced ? 'auto' : 'smooth';
                if (target) {
                    target.scrollIntoView({ behavior, block: 'start' });
                    if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName))
                        target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                }
                else
                    window.scrollBy({ top: window.innerHeight * 0.9, behavior });
            });
            this.onCleanup(() => {
                btn.remove();
                this._gone = false;
            });
            btn.toggleAttribute('data-static', this.reduced);
            check();
        }
    }, { id: 'page-kit', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { CUE_KINDS as C, defineScrollCue as d };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/scroll-cue-C3Nq-6wT.js.map