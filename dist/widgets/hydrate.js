import { f as defineElement } from '../chunks/base-zSGb8ujt.js';
import { HYDRATE_PRESETS, createTimeline } from '../components/engine.js';

var css = "usa-hydrate{display:block}";

function defineHydrate(tag = 'usa-hydrate') {
    return defineElement(tag, (Base) => {
        class UsaHydrate extends Base {
            constructor() {
                super(...arguments);
                this._tl = null;
            }
            static get observedAttributes() {
                return ['effect', 'stagger', 'duration'];
            }
            get timeline() {
                return this._tl;
            }
            mount() {
                this.replay();
            }
            unmount() {
                this._tl?.cancel();
                this._tl = null;
            }
            replay() {
                this._tl?.cancel();
                const kids = Array.from(this.children);
                const frames = HYDRATE_PRESETS[this.str('effect', 'fade-up')] || HYDRATE_PRESETS['fade-up'];
                const tl = createTimeline({ duration: this.num('duration', 600), easing: 'cubic-bezier(.2,.8,.2,1)' });
                const stagger = this.num('stagger', 60);
                kids.forEach((k, i) => tl.add(k, frames, {}, i * stagger));
                this._tl = tl;
                tl.play();
                this.setAttribute('data-usa-hydrated', '');
                tl.finished.then(() => this.isConnected && this._tl === tl && this.emit('hydrated', { count: kids.length }));
            }
        }
        return UsaHydrate;
    }, { id: 'hydrate', text: css });
}

export { defineHydrate };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.2.0/dist/widgets/hydrate.js.map