'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-XCjQREWy.cjs');

function defineRideStatus(tag = 'usa-ride-status') {
    const ctor = base.defineElement(tag, Base => {
        class RideStatus extends activity.activityClass(Base, 'ride-status', activity.rideView, 48) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'status', 'driver']; }
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
        return RideStatus;
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineRideStatus = defineRideStatus;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/ride-status.cjs.map