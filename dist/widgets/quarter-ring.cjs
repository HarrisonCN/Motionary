'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var loaders = require('../chunks/loaders-Bo75693N.cjs');

function defineQuarterRing(tag = 'usa-quarter-ring') {
    const ctor = base.defineElement(tag, Base => class QuarterRing extends Base {
        static get observedAttributes() { return ['label', 'paused', 'duration']; }
        get paused() { return this.flag('paused'); }
        set paused(on) { this.setFlag('paused', !!on); }
        changed() { this._sync?.(); }
        mount() {
            this._sync = loaders.mountLoader(this, { kind: 'quarter', parts: 1, lap: 900 });
            this.onCleanup(() => { this._sync = undefined; });
        }
    }, { id: 'moment-loaders', text: loaders.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineQuarterRing = defineQuarterRing;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/quarter-ring.cjs.map