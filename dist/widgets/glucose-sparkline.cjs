'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-BAIQ_ZAz.cjs');

function defineGlucoseSparkline(tag = 'usa-glucose-sparkline') {
    const ctor = base.defineElement(tag, Base => {
        class GlucoseSparkline extends activity.activityClass(Base, 'glucose-sparkline', activity.glucoseView, 7.2) {
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
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineGlucoseSparkline = defineGlucoseSparkline;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/glucose-sparkline.cjs.map