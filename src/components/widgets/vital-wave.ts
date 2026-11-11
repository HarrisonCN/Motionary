import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { activityClass, type UsaActivityElement, type ActivityData } from './activity-common';
import { heartbeatView } from './activity-views';
import css from './activity.css?raw';

/** `<mo-vital-wave>` — compact live-activity vital wave. Data is supplied by attributes or update().
 * No network or simulated readings. `animated` enables ornamental motion; `running` explicitly enables supported clocks.
 * Buttons emit usa:action / usa:change; clocks emit usa:tick and usa:complete. All resources stop on disconnect.
 */
export interface UsaVitalWaveElement extends UsaActivityElement {
  update(data: ActivityData): void;
  play(): void;
  pause(): void;
  reset(): void;
}
export function defineVitalWave(tag = 'usa-vital-wave'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class VitalWave extends activityClass(Base, 'vital-wave', heartbeatView, 82) {
      static get observedAttributes(): string[] { return ['label', 'value', 'disabled', 'animated', 'running', 'values', 'unit', 'period']; }
      notify(type: 'action' | 'change' | 'tick' | 'complete', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail);
        else if (type === 'change') this.emit('change', detail);
        else if (type === 'tick') this.emit('tick', detail);
        else this.emit('complete', detail);
      }
    }
    return VitalWave;
  }, { id: 'live-activity', text: css });
  defineMoName(tag, ctor); return ctor;
}
