import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, r as raceView } from '../chunks/activity-Dk2_9o_s.js';

function defineRaceTelemetry(tag = 'usa-race-telemetry') {
    const ctor = defineElement(tag, Base => {
        class RaceTelemetry extends activityClass(Base, 'race-telemetry', raceView, 72) {
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
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineRaceTelemetry };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/race-telemetry.js.map