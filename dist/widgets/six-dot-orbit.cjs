'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var loaders = require('../chunks/loaders-Bo75693N.cjs');

function defineSixDotOrbit(tag = 'usa-six-dot-orbit') {
    const ctor = base.defineElement(tag, Base => class SixDotOrbit extends Base {
        static get observedAttributes() { return ['label', 'paused', 'duration']; }
        get paused() { return this.flag('paused'); }
        set paused(on) { this.setFlag('paused', !!on); }
        changed() { this._sync?.(); }
        mount() {
            this._sync = loaders.mountLoader(this, { kind: 'orbit', parts: 6, lap: 1200 });
            this.onCleanup(() => { this._sync = undefined; });
        }
    }, { id: 'moment-loaders', text: loaders.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSixDotOrbit = defineSixDotOrbit;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.9.0/dist/widgets/six-dot-orbit.cjs.map