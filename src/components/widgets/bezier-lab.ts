import { defineElement } from '../base';
import { defineMoName } from './mo-name';
import { matterToolClass, type UsaMatterToolElement } from './matter-tools';
import type { MatterData } from './matter-common';
import css from './matter.css?raw';

/** `<mo-bezier-lab>` — an original interactive bezier study (17.6), with keyboard controls and motion-safe cleanup. */
export interface UsaBezierLabElement extends UsaMatterToolElement {
  update(data: MatterData): void;
  reset(): void;
  play(): void;
  pause(): void;
}
export function defineBezierLab(tag = 'usa-bezier-lab'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class BezierLab extends matterToolClass(Base, 'bezier') {
      static get observedAttributes(): string[] { return ['label', 'disabled', 'x1', 'y1', 'x2', 'y2', 'duration']; }
      notify(type: 'action' | 'change', detail: Record<string, unknown>): void {
        if (type === 'action') this.emit('action', detail); else this.emit('change', detail);
      }
    }
    return BezierLab;
  }, { id: 'matter', text: css });
  defineMoName(tag, ctor); return ctor;
}
