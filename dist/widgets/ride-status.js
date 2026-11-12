import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, e as rideView } from '../chunks/activity-G3K6LHEP.js';

function defineRideStatus(tag = 'usa-ride-status') {
    const ctor = defineElement(tag, Base => {
        class RideStatus extends activityClass(Base, 'ride-status', rideView, 48) {
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
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineRideStatus };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/ride-status.js.map