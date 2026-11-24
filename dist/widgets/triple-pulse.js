import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, m as mountLoader } from '../chunks/loaders-GsGWzSqf.js';

function defineTriplePulse(tag = 'usa-triple-pulse') {
    const ctor = defineElement(tag, Base => class TriplePulse extends Base {
        static get observedAttributes() { return ['label', 'paused', 'duration']; }
        get paused() { return this.flag('paused'); }
        set paused(on) { this.setFlag('paused', !!on); }
        changed() { this._sync?.(); }
        mount() {
            this._sync = mountLoader(this, { kind: 'pulse', parts: 3, lap: 1800 });
            this.onCleanup(() => { this._sync = undefined; });
        }
    }, { id: 'moment-loaders', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineTriplePulse };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/triple-pulse.js.map