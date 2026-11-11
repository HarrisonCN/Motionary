import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, f as flightView } from '../chunks/activity-G3K6LHEP.js';

function defineFlightStatus(tag = 'usa-flight-status') {
    const ctor = defineElement(tag, Base => {
        class FlightStatus extends activityClass(Base, 'flight-status', flightView, 68) {
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
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineFlightStatus };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/flight-status.js.map