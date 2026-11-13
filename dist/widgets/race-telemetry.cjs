'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-XCjQREWy.cjs');

function defineRaceTelemetry(tag = 'usa-race-telemetry') {
    const ctor = base.defineElement(tag, Base => {
        class RaceTelemetry extends activity.activityClass(Base, 'race-telemetry', activity.raceView, 72) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'lap', 'lap-label', 'laps', 'sector']; }
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
        return RaceTelemetry;
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineRaceTelemetry = defineRaceTelemetry;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/race-telemetry.cjs.map