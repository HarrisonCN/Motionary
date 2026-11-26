import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, m as mountLoader } from '../chunks/loaders-GsGWzSqf.js';

function defineQuarterRing(tag = 'usa-quarter-ring') {
    const ctor = defineElement(tag, Base => class QuarterRing extends Base {
        static get observedAttributes() { return ['label', 'paused', 'duration']; }
        get paused() { return this.flag('paused'); }
        set paused(on) { this.setFlag('paused', !!on); }
        changed() { this._sync?.(); }
        mount() {
            this._sync = mountLoader(this, { kind: 'quarter', parts: 1, lap: 900 });
            this.onCleanup(() => { this._sync = undefined; });
        }
    }, { id: 'moment-loaders', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineQuarterRing };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.17.0/dist/widgets/quarter-ring.js.map