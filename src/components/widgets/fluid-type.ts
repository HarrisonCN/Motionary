import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { matterClass, type UsaMatterElement } from './matter-common';
import type { MatterData } from './matter-common';
import css from './matter.css?raw';

/** `<mo-fluid-type>` — an original interactive fluid study (17.6), with keyboard controls and motion-safe cleanup. */
export interface UsaFluidTypeElement extends UsaMatterElement {
  update(data: MatterData): void;
  reset(): void;
  play(): void;
  pause(): void;
  activate(): void;
  deactivate(): void;
}
export function defineFluidType(tag = 'usa-fluid-type'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class FluidType extends matterClass(Base, 'fluid') {
      static get observedAttributes(): string[] { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'text', 'fill']; }
      notify(type: 'action' | 'change', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail); else this.emit('change', detail);
      }
    }
    return FluidType;
  }, { id: 'matter', text: css });
  defineMoName(tag, ctor); return ctor;
}
