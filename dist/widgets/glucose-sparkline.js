import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, g as glucoseView } from '../chunks/activity-G3K6LHEP.js';

function defineGlucoseSparkline(tag = 'usa-glucose-sparkline') {
    const ctor = defineElement(tag, Base => {
        class GlucoseSparkline extends activityClass(Base, 'glucose-sparkline', glucoseView, 7.2) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'values', 'unit', 'trend', 'start', 'middle', 'end']; }
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
        return GlucoseSparkline;
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineGlucoseSparkline };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/glucose-sparkline.js.map