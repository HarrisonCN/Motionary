'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-BAhympNW.cjs');

function defineSunTimeline(tag = 'usa-sun-timeline') {
    const ctor = base.defineElement(tag, Base => {
        class SunTimeline extends activity.activityClass(Base, 'sun-timeline', activity.sunView, 0) {
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
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineSunTimeline = defineSunTimeline;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/sun-timeline.cjs.map