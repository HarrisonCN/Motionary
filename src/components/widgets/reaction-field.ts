import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { matterClass, type UsaMatterElement } from './matter-common';
import type { MatterData } from './matter-common';
import css from './matter.css?raw';

/** `<mo-reaction-field>` — an original interactive reaction study (17.6), with keyboard controls and motion-safe cleanup. */
export interface UsaReactionFieldElement extends UsaMatterElement {
  update(data: MatterData): void;
  reset(): void;
  play(): void;
  pause(): void;
  activate(): void;
  deactivate(): void;
}
export function defineReactionField(tag = 'usa-reaction-field'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class ReactionField extends matterClass(Base, 'reaction') {
      static get observedAttributes(): string[] { return ['label', 'disabled', 'animated', 'paused', 'color', 'accent', 'seed', 'feed', 'kill', 'mode', 'shape']; }
      notify(type: 'action' | 'change', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail); else this.emit('change', detail);
      }
    }
    return ReactionField;
  }, { id: 'matter', text: css });
  defineMoName(tag, ctor); return ctor;
}
