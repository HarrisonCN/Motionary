import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './moments.css?raw';

/**
 * A light / dark switch drawn as an eclipse: a disc slides over the sun, the rays retract and a thin corona stays.
 * A native `<button role="switch">` handles pointer, Enter and Space. Attributes: `checked`, `label`, `disabled`.
 * Event `usa:change` ({ checked }). It reports the state only; the page decides what dark means.
 */
export interface UsaEclipseToggleElement extends UsaElement {
  checked: boolean;
  toggle(force?: boolean): boolean;
}

export function defineEclipseToggle(tag = 'usa-eclipse-toggle'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class EclipseToggle extends Base {
    static get observedAttributes(): string[] { return ['checked', 'label', 'disabled']; }
    private _sync?: () => void;
    get checked(): boolean { return this.flag('checked'); }
    set checked(on: boolean) { this.setFlag('checked', !!on); }
    toggle(force?: boolean): boolean {
      if (this.flag('disabled')) return this.checked;
      this.checked = force === undefined ? !this.checked : !!force;
      return this.checked;
    }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('button', 'usa-moment usa-eclipse');
      root.type = 'button';
      root.setAttribute('role', 'switch');
      const sky = make('span', 'usa-eclipse-sky');
      sky.setAttribute('aria-hidden', 'true');
      const sun = make('span', 'usa-eclipse-sun');
      for (let i = 0; i < 8; i++) {
        const ray = make('i', 'usa-eclipse-ray');
        ray.style.setProperty('--i', String(i));
        sky.append(ray);
      }
      sky.append(sun, make('span', 'usa-eclipse-moon'));
      const text = make('span', 'usa-eclipse-label');
      root.append(sky, text);
      this.append(root);
      const sync = () => {
        const on = this.checked;
        text.textContent = this.str('label', 'Dark mode');
        root.setAttribute('aria-checked', String(on));
        root.toggleAttribute('data-on', on);
        root.toggleAttribute('data-static', this.reduced);
        root.disabled = this.flag('disabled');
      };
      this._sync = sync;
      this.listen(root, 'click', () => {
        if (this.flag('disabled')) return;
        const checked = this.toggle();
        this.emit('change', { checked });
      });
      this.onCleanup(() => { root.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'moments', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
