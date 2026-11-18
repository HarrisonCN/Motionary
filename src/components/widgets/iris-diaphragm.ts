import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { bounded, instrumentPanel } from './instrument-panel';
import css from './instrument-panel.css?raw';

/** Pivot nine overlapping blades to vary the opening. The value ranges from 0 to 100. */
export interface UsaIrisDiaphragmElement extends UsaElement {
  value: number;
}

export function defineIrisDiaphragm(tag = 'usa-iris-diaphragm'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class IrisDiaphragm extends Base {
    static get observedAttributes(): string[] { return ['value', 'label']; }
    private sync?: () => void;
    get value(): number { return Math.round(bounded(this.num('value', 45))); }
    set value(n: number) { this.setAttribute('value', String(Math.round(bounded(n)))); }
    changed(): void { this.sync?.(); }
    mount(): void {
      this.sync = instrumentPanel(this, 'iris',
        value => this.emit('input', { value }),
        value => this.emit('change', { value }));
    }
    unmount(): void { this.sync = undefined; }
  }, { id: 'instrument-panel', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
