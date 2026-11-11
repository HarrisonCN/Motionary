import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { activityClass, type UsaActivityElement, type ActivityData } from './activity-common';
import { deliveryView } from './activity-views';
import css from './activity.css?raw';

/** `<mo-delivery-tracker>` — compact live-activity delivery tracker. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
export interface UsaDeliveryTrackerElement extends UsaActivityElement {
  update(data: ActivityData): void;
  play(): void;
  pause(): void;
  reset(): void;
}
export function defineDeliveryTracker(tag = 'usa-delivery-tracker'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class DeliveryTracker extends activityClass(Base, 'delivery-tracker', deliveryView, 34) {
      static get observedAttributes(): string[] { return ['label', 'value', 'disabled', 'animated', 'running', 'stage', 'status-label', 'status', 'eta-label', 'eta', 'driver', 'call-label', 'message-label']; }
      notify(type: 'action' | 'change' | 'tick' | 'complete', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail);
        else if (type === 'change') this.emit('change', detail);
        else if (type === 'tick') this.emit('tick', detail);
        else this.emit('complete', detail);
      }
    }
    return DeliveryTracker;
  }, { id: 'live-activity', text: css });
  defineMoName(tag, ctor); return ctor;
}
