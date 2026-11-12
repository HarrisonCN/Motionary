'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-XCjQREWy.cjs');

function defineFlightStatus(tag = 'usa-flight-status') {
    const ctor = base.defineElement(tag, Base => {
        class FlightStatus extends activity.activityClass(Base, 'flight-status', activity.flightView, 68) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'origin', 'destination', 'from', 'to', 'departure', 'arrival', 'status']; }
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
        return FlightStatus;
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineFlightStatus = defineFlightStatus;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/flight-status.cjs.map