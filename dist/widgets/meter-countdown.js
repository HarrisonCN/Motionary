import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, m as meterView } from '../chunks/activity-G3K6LHEP.js';

function defineMeterCountdown(tag = 'usa-meter-countdown') {
    const ctor = defineElement(tag, Base => {
        class MeterCountdown extends activityClass(Base, 'meter-countdown', meterView, 81, 'remaining') {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'max', 'title']; }
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
        return MeterCountdown;
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineMeterCountdown };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.7.0/dist/widgets/meter-countdown.js.map