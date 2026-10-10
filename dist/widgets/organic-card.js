import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { blobRadius } from '../components/fx-organic.js';
import '../chunks/registry-CYojuxi5.js';

var css = "usa-organic-card{position:relative;display:block;padding:22px 24px;color:#0f172a;background:linear-gradient(140deg,#d9f99d,#86efac 55%,#34d399);box-shadow:0 18px 36px -22px rgba(22,101,52,.7);transition:box-shadow .3s;outline:none}usa-organic-card[data-tint=ocean]{background:linear-gradient(140deg,#bae6fd,#7dd3fc 50%,#38bdf8);box-shadow:0 18px 36px -22px rgba(3,105,161,.7)}usa-organic-card[data-tint=petal]{background:linear-gradient(140deg,#fbcfe8,#f9a8d4 50%,#f472b6);box-shadow:0 18px 36px -22px rgba(157,23,77,.6)}usa-organic-card[data-tint=sand]{background:linear-gradient(140deg,#fef3c7,#fde68a 50%,#fbbf24);box-shadow:0 18px 36px -22px rgba(146,64,14,.6)}usa-organic-card:hover{box-shadow:0 24px 44px -20px rgba(15,23,42,.45)}usa-organic-card:focus-within{box-shadow:0 0 0 3px rgba(15,23,42,.25),0 24px 44px -20px rgba(15,23,42,.45)}";

function defineOrganicCard(tag = 'usa-organic-card') {
    return defineElement(tag, (Base) => {
        class UsaOrganicCard extends Base {
            constructor() {
                super(...arguments);
                this._seed = 1;
                this._loop = null;
            }
            static get observedAttributes() {
                return ['tint', 'seed'];
            }
            mount() {
                this._seed = this.num('seed', 1);
                this.setAttribute('data-tint', ['ocean', 'petal', 'sand'].includes(this.str('tint')) ? this.str('tint') : 'leaf');
                this.style.borderRadius = blobRadius(this._seed);
                this.inView((v) => {
                    this._loop?.cancel();
                    this._loop = null;
                    if (!v || this.reduced)
                        return;
                    const frames = [0, 1, 2, 0].map((k, i) => ({ borderRadius: blobRadius(this._seed + k), offset: i / 3 }));
                    this._loop = this.motion(this, frames, { duration: 9000, iterations: Infinity, easing: 'ease-in-out' });
                });
                this.listen(this, 'pointerenter', () => this.morph(this._seed + 7));
                this.listen(this, 'pointerleave', () => this.morph(this._seed));
                this.onCleanup(() => this._loop?.cancel());
            }
            /** Morph to the blob shape of `seed` (random when omitted). */
            morph(seed = Math.random() * 100) {
                const to = blobRadius(seed);
                const from = this.style.borderRadius || to;
                this.style.borderRadius = to;
                if (!this.reduced)
                    this.motion(this, [{ borderRadius: from }, { borderRadius: to }], { duration: 700, easing: 'cubic-bezier(.3,1.3,.5,1)', composite: 'replace' });
            }
        }
        return UsaOrganicCard;
    }, { id: 'organic-card', text: css });
}

export { defineOrganicCard };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.5.0/dist/widgets/organic-card.js.map