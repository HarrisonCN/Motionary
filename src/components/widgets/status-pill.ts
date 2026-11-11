import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { activityClass, type UsaActivityElement, type ActivityData } from './activity-common';
import { pillView } from './activity-views';
import css from './activity.css?raw';

/** `<mo-status-pill>` — compact live-activity status pill. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
export interface UsaStatusPillElement extends UsaActivityElement {
  update(data: ActivityData): void;
  play(): void;
  pause(): void;
  reset(): void;
}
export function defineStatusPill(tag = 'usa-status-pill'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class StatusPill extends activityClass(Base, 'status-pill', pillView, 5) {
      static get observedAttributes(): string[] { return ['label', 'value', 'disabled', 'animated', 'running', 'icon', 'unit', 'status', 'tone']; }
      notify(type: 'action' | 'change' | 'tick' | 'complete', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail);
        else if (type === 'change') this.emit('change', detail);
        else if (type === 'tick') this.emit('tick', detail);
        else this.emit('complete', detail);
      }
    }
    return StatusPill;
  }, { id: 'live-activity', text: css });
  defineMoName(tag, ctor); return ctor;
}
