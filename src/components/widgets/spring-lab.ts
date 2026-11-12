import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { matterToolClass, type UsaMatterToolElement } from './matter-tools';
import type { MatterData } from './matter-common';
import css from './matter.css?raw';

/** `<mo-spring-lab>` — an original interactive spring study (17.6), with keyboard controls and motion-safe cleanup. */
export interface UsaSpringLabElement extends UsaMatterToolElement {
  update(data: MatterData): void;
  reset(): void;
  play(): void;
  pause(): void;
}
export function defineSpringLab(tag = 'usa-spring-lab'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class SpringLab extends matterToolClass(Base, 'spring') {
      static get observedAttributes(): string[] { return ['label', 'disabled', 'stiffness', 'damping', 'mass']; }
      notify(type: 'action' | 'change', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail); else this.emit('change', detail);
      }
    }
    return SpringLab;
  }, { id: 'matter', text: css });
  defineMoName(tag, ctor); return ctor;
}
