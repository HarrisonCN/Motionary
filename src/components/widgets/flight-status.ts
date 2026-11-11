import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { activityClass, type UsaActivityElement, type ActivityData } from './activity-common';
import { flightView } from './activity-views';
import css from './activity.css?raw';

/** `<mo-flight-status>` — compact live-activity flight status. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
export interface UsaFlightStatusElement extends UsaActivityElement {
  update(data: ActivityData): void;
  play(): void;
  pause(): void;
  reset(): void;
}
export function defineFlightStatus(tag = 'usa-flight-status'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class FlightStatus extends activityClass(Base, 'flight-status', flightView, 68) {
      static get observedAttributes(): string[] { return ['label', 'value', 'disabled', 'animated', 'running', 'origin', 'destination', 'from', 'to', 'departure', 'arrival', 'status']; }
      notify(type: 'action' | 'change' | 'tick' | 'complete', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail);
        else if (type === 'change') this.emit('change', detail);
        else if (type === 'tick') this.emit('tick', detail);
        else this.emit('complete', detail);
      }
    }
    return FlightStatus;
  }, { id: 'live-activity', text: css });
  defineMoName(tag, ctor); return ctor;
}
