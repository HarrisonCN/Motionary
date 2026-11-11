'use strict';

var base = require('../chunks/base-DzZEJhQB.cjs');
var moName = require('../chunks/mo-name-DR9ysd5S.cjs');
var activity = require('../chunks/activity-XCjQREWy.cjs');

function defineDeliveryTracker(tag = 'usa-delivery-tracker') {
    const ctor = base.defineElement(tag, Base => {
        class DeliveryTracker extends activity.activityClass(Base, 'delivery-tracker', activity.deliveryView, 34) {
            static get observedAttributes() { return ['label', 'value', 'disabled', 'animated', 'running', 'stage', 'status-label', 'status', 'eta-label', 'eta', 'driver', 'call-label', 'message-label']; }
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
        return DeliveryTracker;
    }, { id: 'live-activity', text: activity.css });
    moName.defineMoName(tag, ctor);
    return ctor;
}

exports.defineDeliveryTracker = defineDeliveryTracker;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.5.0/dist/widgets/delivery-tracker.cjs.map