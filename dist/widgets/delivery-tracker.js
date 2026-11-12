import { f as defineElement } from '../chunks/base-SPDwWyB1.js';
import { d as defineMoName } from '../chunks/mo-name-DT5wwaGR.js';
import { c as css, a as activityClass, d as deliveryView } from '../chunks/activity-G3K6LHEP.js';

function defineDeliveryTracker(tag = 'usa-delivery-tracker') {
    const ctor = defineElement(tag, Base => {
        class DeliveryTracker extends activityClass(Base, 'delivery-tracker', deliveryView, 34) {
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
    }, { id: 'live-activity', text: css });
    defineMoName(tag, ctor);
    return ctor;
}

export { defineDeliveryTracker };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/widgets/delivery-tracker.js.map