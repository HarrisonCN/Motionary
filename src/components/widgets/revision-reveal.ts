import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { matterTextClass, type UsaMatterTextElement } from './matter-text';
import type { MatterData } from './matter-common';
import css from './matter.css?raw';

/** `<mo-revision-reveal>` — an original interactive revision study (17.6), with keyboard controls and motion-safe cleanup. */
export interface UsaRevisionRevealElement extends UsaMatterTextElement {
  update(data: MatterData): void;
  reset(): void;
  value: number;
}
export function defineRevisionReveal(tag = 'usa-revision-reveal'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class RevisionReveal extends matterTextClass(Base, 'revision') {
      static get observedAttributes(): string[] { return ['label', 'disabled', 'text', 'draft', 'value']; }
      notify(type: 'action' | 'change', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail); else this.emit('change', detail);
      }
    }
    return RevisionReveal;
  }, { id: 'matter', text: css });
  defineMoName(tag, ctor); return ctor;
}
