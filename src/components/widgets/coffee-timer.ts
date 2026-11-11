import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { activityClass, type UsaActivityElement, type ActivityData } from './activity-common';
import { coffeeView } from './activity-views';
import css from './activity.css?raw';

/** `<mo-coffee-timer>` — compact live-activity coffee timer. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
export interface UsaCoffeeTimerElement extends UsaActivityElement {
  update(data: ActivityData): void;
  play(): void;
  pause(): void;
  reset(): void;
}
export function defineCoffeeTimer(tag = 'usa-coffee-timer'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class CoffeeTimer extends activityClass(Base, 'coffee-timer', coffeeView, 18, 'elapsed') {
      static get observedAttributes(): string[] { return ['label', 'value', 'disabled', 'animated', 'running', 'duration', 'drink']; }
      notify(type: 'action' | 'change' | 'tick' | 'complete', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail);
        else if (type === 'change') this.emit('change', detail);
        else if (type === 'tick') this.emit('tick', detail);
        else this.emit('complete', detail);
      }
    }
    return CoffeeTimer;
  }, { id: 'live-activity', text: css });
  defineMoName(tag, ctor); return ctor;
}
