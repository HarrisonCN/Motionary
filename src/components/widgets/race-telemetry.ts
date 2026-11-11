import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { activityClass, type UsaActivityElement, type ActivityData } from './activity-common';
import { raceView } from './activity-views';
import css from './activity.css?raw';

/** `<mo-race-telemetry>` — compact live-activity race telemetry. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
export interface UsaRaceTelemetryElement extends UsaActivityElement {
  update(data: ActivityData): void;
  play(): void;
  pause(): void;
  reset(): void;
}
export function defineRaceTelemetry(tag = 'usa-race-telemetry'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class RaceTelemetry extends activityClass(Base, 'race-telemetry', raceView, 72) {
      static get observedAttributes(): string[] { return ['label', 'value', 'disabled', 'animated', 'running', 'lap', 'lap-label', 'laps', 'sector']; }
      notify(type: 'action' | 'change' | 'tick' | 'complete', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail);
        else if (type === 'change') this.emit('change', detail);
        else if (type === 'tick') this.emit('tick', detail);
        else this.emit('complete', detail);
      }
    }
    return RaceTelemetry;
  }, { id: 'live-activity', text: css });
  defineMoName(tag, ctor); return ctor;
}
