import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, m as mountLoader } from '../chunks/loaders-GsGWzSqf.js';

function defineThreeDotBounce(tag = 'usa-three-dot-bounce') {
    const ctor = defineElement(tag, Base => class ThreeDotBounce extends Base {
        static get observedAttributes() { return ['label', 'paused', 'duration']; }
        get paused() { return this.flag('paused'); }
        set paused(on) { this.setFlag('paused', !!on); }
        changed() { this._sync?.(); }
        mount() {
            this._sync = mountLoader(this, { kind: 'dots', parts: 3, lap: 1000 });
            this.onCleanup(() => { this._sync = undefined; });
        }
    }, { id: 'moment-loaders', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineThreeDotBounce };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/three-dot-bounce.js.map