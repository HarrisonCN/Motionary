'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-BAIQ_ZAz.cjs');

function defineMeterCountdown(tag = 'usa-meter-countdown') {
    const ctor = base.defineElement(tag, Base => {
        class MeterCountdown extends activity.activityClass(Base, 'meter-countdown', activity.meterView, 81, 'remaining') {
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
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineMeterCountdown = defineMeterCountdown;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/meter-countdown.cjs.map