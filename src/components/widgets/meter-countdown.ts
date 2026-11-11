import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { activityClass, type UsaActivityElement, type ActivityData } from './activity-common';
import { meterView } from './activity-views';
import css from './activity.css?raw';

/** `<mo-meter-countdown>` — compact live-activity meter countdown. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
export interface UsaMeterCountdownElement extends UsaActivityElement {
  update(data: ActivityData): void;
  play(): void;
  pause(): void;
  reset(): void;
}
export function defineMeterCountdown(tag = 'usa-meter-countdown'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class MeterCountdown extends activityClass(Base, 'meter-countdown', meterView, 81, 'remaining') {
      static get observedAttributes(): string[] { return ['label', 'value', 'disabled', 'animated', 'running', 'max', 'title']; }
      notify(type: 'action' | 'change' | 'tick' | 'complete', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail);
        else if (type === 'change') this.emit('change', detail);
        else if (type === 'tick') this.emit('tick', detail);
        else this.emit('complete', detail);
      }
    }
    return MeterCountdown;
  }, { id: 'live-activity', text: css });
  defineMoName(tag, ctor); return ctor;
}
