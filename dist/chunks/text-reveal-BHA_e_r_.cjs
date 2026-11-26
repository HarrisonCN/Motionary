'use strict';

var base = require('./base-DzZEJhQB.cjs');
var moName = require('./mo-name-DR9ysd5S.cjs');
var moments = require('./moments-eoZA2npZ.cjs');
var momentsUi = require('./moments-ui-Wb8gBRiX.cjs');

/** The pieces a reveal animates: words (spaces kept as their own pieces) or characters. */
function revealPieces(text, by) {
    if (by === 'char')
        return Array.from(text);
    return text.split(/(\s+)/).filter((p) => p !== '');
}
function defineTextReveal(tag = 'usa-text-reveal') {
    const ctor = base.defineElement(tag, Base => class TextReveal extends Base {
        static get observedAttributes() { return ['text', 'by', 'stagger', 'once']; }
        replay() { this._replay?.(); }
        mount() {
            const text = this.str('text', 'Moments');
            const by = this.str('by') === 'word' ? 'word' : 'char';
            const root = moments.make('span', 'usa-moment usa-reveal');
            root.style.setProperty('--stagger', `${moments.bound(this.num('stagger', 45), 10, 300, 45)}ms`);
            const art = moments.make('span', 'usa-reveal-art');
            art.setAttribute('aria-hidden', 'true');
            revealPieces(text, by).forEach((piece, i) => {
                const span = moments.make('span', /^\s+$/.test(piece) ? 'usa-reveal-gap' : 'usa-reveal-piece', piece);
                span.style.setProperty('--i', String(i));
                art.append(span);
            });
            root.append(art, moments.make('span', 'usa-sr', text));
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
    }, { id: 'moment-ui', text: momentsUi.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineTextReveal = defineTextReveal;
exports.revealPieces = revealPieces;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/chunks/text-reveal-BHA_e_r_.cjs.map