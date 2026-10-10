'use strict';

var base = require('../chunks/base-vu_KhBiv.cjs');
var components_engine = require('../components/engine.cjs');

var css = "usa-hydrate{display:block}";

function defineHydrate(tag = 'usa-hydrate') {
    return base.defineElement(tag, (Base) => {
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
                const frames = components_engine.HYDRATE_PRESETS[this.str('effect', 'fade-up')] || components_engine.HYDRATE_PRESETS['fade-up'];
                const tl = components_engine.createTimeline({ duration: this.num('duration', 600), easing: 'cubic-bezier(.2,.8,.2,1)' });
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

exports.defineHydrate = defineHydrate;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.2.0/dist/widgets/hydrate.cjs.map