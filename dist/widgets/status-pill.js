import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, p as pillView } from '../chunks/activity-Dk2_9o_s.js';

function defineStatusPill(tag = 'usa-status-pill') {
    const ctor = defineElement(tag, Base => {
        class StatusPill extends activityClass(Base, 'status-pill', pillView, 5) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'icon', 'unit', 'status', 'tone']; }
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
        return StatusPill;
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineStatusPill };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/status-pill.js.map