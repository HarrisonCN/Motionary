'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-XCjQREWy.cjs');

function defineVitalWave(tag = 'usa-vital-wave') {
    const ctor = base.defineElement(tag, Base => {
        class VitalWave extends activity.activityClass(Base, 'vital-wave', activity.heartbeatView, 82) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'values', 'unit', 'period']; }
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
        return VitalWave;
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineVitalWave = defineVitalWave;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/vital-wave.cjs.map