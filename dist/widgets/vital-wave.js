import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, i as heartbeatView } from '../chunks/activity-XkTm51Nm.js';

function defineVitalWave(tag = 'usa-vital-wave') {
    const ctor = defineElement(tag, Base => {
        class VitalWave extends activityClass(Base, 'vital-wave', heartbeatView, 82) {
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
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineVitalWave };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/vital-wave.js.map