import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { bounded, instrumentPanel } from './instrument-panel';
import css from './instrument-panel.css?raw';

/** Separate seven coaxial lens sections with a horizontal drag. The value ranges from 0 to 100. */
export interface UsaLensStackElement extends UsaElement {
  value: number;
}

export function defineLensStack(tag = 'usa-lens-stack'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class LensStack extends Base {
    static get observedAttributes(): string[] { return ['value', 'label']; }
    private sync?: () => void;
    get value(): number { return Math.round(bounded(this.num('value', 42))); }
    set value(n: number) { this.setAttribute('value', String(Math.round(bounded(n)))); }
    changed(): void { this.sync?.(); }
    mount(): void {
      this.sync = instrumentPanel(this, 'lens',
        value => this.emit('input', { value }),
        value => this.emit('change', { value }));
    }
    unmount(): void { this.sync = undefined; }
  }, { id: 'instrument-panel', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
