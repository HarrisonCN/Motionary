import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, t as transitView } from '../chunks/activity-Dk2_9o_s.js';

function defineTransitProgress(tag = 'usa-transit-progress') {
    const ctor = defineElement(tag, Base => {
        class TransitProgress extends activityClass(Base, 'transit-progress', transitView, 50) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'stations']; }
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
        return TransitProgress;
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineTransitProgress };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/transit-progress.js.map