import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { matterClass, type UsaMatterElement } from './matter-common';
import type { MatterData } from './matter-common';
import css from './matter.css?raw';

/** `<mo-gravity-well>` — an original interactive gravity study (17.6), with keyboard controls and motion-safe cleanup. */
export interface UsaGravityWellElement extends UsaMatterElement {
  update(data: MatterData): void;
  reset(): void;
  play(): void;
  pause(): void;
  activate(): void;
  deactivate(): void;
}
export function defineGravityWell(tag = 'usa-gravity-well'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class GravityWell extends matterClass(Base, 'gravity') {
      static get observedAttributes(): string[] { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'seed', 'count', 'strength']; }
      notify(type: 'action' | 'change', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail); else this.emit('change', detail);
      }
    }
    return GravityWell;
  }, { id: 'matter', text: css });
  defineMoName(tag, ctor); return ctor;
}
