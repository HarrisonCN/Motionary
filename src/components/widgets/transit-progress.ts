import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { activityClass, type UsaActivityElement, type ActivityData } from './activity-common';
import { transitView } from './activity-views';
import css from './activity.css?raw';

/** `<mo-transit-progress>` — compact live-activity transit progress. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
export interface UsaTransitProgressElement extends UsaActivityElement {
  update(data: ActivityData): void;
  play(): void;
  pause(): void;
  reset(): void;
}
export function defineTransitProgress(tag = 'usa-transit-progress'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class TransitProgress extends activityClass(Base, 'transit-progress', transitView, 50) {
      static get observedAttributes(): string[] { return ['label', 'value', 'disabled', 'animated', 'running', 'stations']; }
      notify(type: 'action' | 'change' | 'tick' | 'complete', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail);
        else if (type === 'change') this.emit('change', detail);
        else if (type === 'tick') this.emit('tick', detail);
        else this.emit('complete', detail);
      }
    }
    return TransitProgress;
  }, { id: 'live-activity', text: css });
  defineMoName(tag, ctor); return ctor;
}
