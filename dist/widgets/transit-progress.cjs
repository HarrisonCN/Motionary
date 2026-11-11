'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-BAIQ_ZAz.cjs');

function defineTransitProgress(tag = 'usa-transit-progress') {
    const ctor = base.defineElement(tag, Base => {
        class TransitProgress extends activity.activityClass(Base, 'transit-progress', activity.transitView, 50) {
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
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineTransitProgress = defineTransitProgress;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/transit-progress.cjs.map