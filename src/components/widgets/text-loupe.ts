import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { matterTextClass, type UsaMatterTextElement } from './matter-text';
import type { MatterData } from './matter-common';
import css from './matter.css?raw';

/** `<mo-text-loupe>` — an original interactive loupe study (17.6), with keyboard controls and motion-safe cleanup. */
export interface UsaTextLoupeElement extends UsaMatterTextElement {
  update(data: MatterData): void;
  reset(): void;
  focusAt(x: number, y: number): void;
}
export function defineTextLoupe(tag = 'usa-text-loupe'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class TextLoupe extends matterTextClass(Base, 'loupe') {
      static get observedAttributes(): string[] { return ['label', 'disabled', 'text']; }
      notify(type: 'action' | 'change', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail); else this.emit('change', detail);
      }
    }
    return TextLoupe;
  }, { id: 'matter', text: css });
  defineMoName(tag, ctor); return ctor;
}
