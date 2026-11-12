import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { matterClass, type UsaMatterElement } from './matter-common';
import type { MatterData } from './matter-common';
import css from './matter.css?raw';

/** `<mo-liquid-metal>` — an original interactive metal study (17.6), with keyboard controls and motion-safe cleanup. */
export interface UsaLiquidMetalElement extends UsaMatterElement {
  update(data: MatterData): void;
  reset(): void;
  play(): void;
  pause(): void;
  activate(): void;
  deactivate(): void;
}
export function defineLiquidMetal(tag = 'usa-liquid-metal'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class LiquidMetal extends matterClass(Base, 'metal') {
      static get observedAttributes(): string[] { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'seed', 'strength']; }
      notify(type: 'action' | 'change', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail); else this.emit('change', detail);
      }
    }
    return LiquidMetal;
  }, { id: 'matter', text: css });
  defineMoName(tag, ctor); return ctor;
}
