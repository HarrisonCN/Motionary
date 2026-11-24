import { f as defineElement } from './base-SPDwWyB1.js';
import { d as defineMoName } from './mo-name-DT5wwaGR.js';
import { m as make, b as bound } from './moments-Cg_NlOYG.js';
import { c as css } from './moments-ui-CQJNkFyY.js';

/** The pieces a reveal animates: words (spaces kept as their own pieces) or characters. */
function revealPieces(text, by) {
    if (by === 'char')
        return Array.from(text);
    return text.split(/(\s+)/).filter((p) => p !== '');
}
function defineTextReveal(tag = 'usa-text-reveal') {
    const ctor = defineElement(tag, Base => class TextReveal extends Base {
        static get observedAttributes() { return ['text', 'by', 'stagger', 'once']; }
        replay() { this._replay?.(); }
        mount() {
            const text = this.str('text', 'Moments');
            const by = this.str('by') === 'word' ? 'word' : 'char';
            const root = make('span', 'usa-moment usa-reveal');
            root.style.setProperty('--stagger', `${bound(this.num('stagger', 45), 10, 300, 45)}ms`);
            const art = make('span', 'usa-reveal-art');
            art.setAttribute('aria-hidden', 'true');
            revealPieces(text, by).forEach((piece, i) => {
                const span = make('span', /^\s+$/.test(piece) ? 'usa-reveal-gap' : 'usa-reveal-piece', piece);
                span.style.setProperty('--i', String(i));
                art.append(span);
            });
            root.append(art, make('span', 'usa-sr', text));
            root.toggleAttribute('data-static', this.reduced);
            this.append(root);
            let shown = false;
            this.inView((visible) => {
                if (visible) {
                    root.setAttribute('data-in', '');
                    shown = true;
                }
                else if (!(shown && this.flag('once')))
                    root.removeAttribute('data-in');
            }, { threshold: 0.2 });
            this._replay = () => {
                root.removeAttribute('data-in');
                void root.offsetWidth; // restart the transitions from the hidden state
                root.setAttribute('data-in', '');
            };
            this.onCleanup(() => { root.remove(); this._replay = undefined; });
        }
    }, { id: 'moment-ui', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineTextReveal as d, revealPieces as r };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/chunks/text-reveal-7bCJpF8m.js.map