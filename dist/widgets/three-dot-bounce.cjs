'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var loaders = require('../chunks/loaders-Bo75693N.cjs');

function defineThreeDotBounce(tag = 'usa-three-dot-bounce') {
    const ctor = base.defineElement(tag, Base => class ThreeDotBounce extends Base {
        static get observedAttributes() { return ['label', 'paused', 'duration']; }
        get paused() { return this.flag('paused'); }
        set paused(on) { this.setFlag('paused', !!on); }
        changed() { this._sync?.(); }
        mount() {
            this._sync = loaders.mountLoader(this, { kind: 'dots', parts: 3, lap: 1000 });
            this.onCleanup(() => { this._sync = undefined; });
        }
    }, { id: 'moment-loaders', text: loaders.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineThreeDotBounce = defineThreeDotBounce;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.18.0/dist/widgets/three-dot-bounce.cjs.map