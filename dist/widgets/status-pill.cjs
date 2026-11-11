'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-XCjQREWy.cjs');

function defineStatusPill(tag = 'usa-status-pill') {
    const ctor = base.defineElement(tag, Base => {
        class StatusPill extends activity.activityClass(Base, 'status-pill', activity.pillView, 5) {
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
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineStatusPill = defineStatusPill;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/status-pill.cjs.map