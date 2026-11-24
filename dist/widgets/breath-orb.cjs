'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var loaders = require('../chunks/loaders-Bo75693N.cjs');

function defineBreathOrb(tag = 'usa-breath-orb') {
    const ctor = base.defineElement(tag, Base => class BreathOrb extends Base {
        static get observedAttributes() { return ['label', 'paused', 'duration']; }
        get paused() { return this.flag('paused'); }
        set paused(on) { this.setFlag('paused', !!on); }
        changed() { this._sync?.(); }
        mount() {
            this._sync = loaders.mountLoader(this, { kind: 'breath', parts: 2, lap: 4000 });
            this.onCleanup(() => { this._sync = undefined; });
        }
    }, { id: 'moment-loaders', text: loaders.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineBreathOrb = defineBreathOrb;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/breath-orb.cjs.map