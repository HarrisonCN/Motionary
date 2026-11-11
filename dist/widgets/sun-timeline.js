import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, s as sunView } from '../chunks/activity-Dk2_9o_s.js';

function defineSunTimeline(tag = 'usa-sun-timeline') {
    const ctor = defineElement(tag, Base => {
        class SunTimeline extends activityClass(Base, 'sun-timeline', sunView, 0) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'now-label', 'sunset-label', 'dusk-label', 'now', 'sunset', 'dusk']; }
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
        return SunTimeline;
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineSunTimeline };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/sun-timeline.js.map