'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-XCjQREWy.cjs');

function defineOrbitPass(tag = 'usa-orbit-pass') {
    const ctor = base.defineElement(tag, Base => {
        class OrbitPass extends activity.activityClass(Base, 'orbit-pass', activity.orbitView, 76) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'title', 'eta']; }
            notify(type, detail) {
                if (type === 'action')
                    this.emit('action', detail);
                else if (type === 'change')
                    this.emit('change', detail);
                else if (type === 'tick')
                    this.emit('tick', detail);
                else
                    this.emit('complete', detail);
            }
        }
        return OrbitPass;
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineOrbitPass = defineOrbitPass;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/orbit-pass.cjs.map