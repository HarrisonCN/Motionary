import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { make } from './moments';
import css from './moments-ui.css?raw';

/**
 * A raised tile that sinks into a groove when turned on and rises back out when turned off; its mark turns with it.
 * A native toggle button (`aria-pressed`) carries pointer, Enter and Space. Attributes: `pressed`, `label` (Pin),
 * `disabled`. Event `usa:change` ({ pressed }).
 */
export interface UsaGrooveToggleElement extends UsaElement {
  pressed: boolean;
  toggle(force?: boolean): boolean;
}

export function defineGrooveToggle(tag = 'usa-groove-toggle'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => class GrooveToggle extends Base {
    static get observedAttributes(): string[] { return ['pressed', 'label', 'disabled']; }
    private _sync?: () => void;
    get pressed(): boolean { return this.flag('pressed'); }
    set pressed(on: boolean) { this.setFlag('pressed', !!on); }
    toggle(force?: boolean): boolean {
      if (this.flag('disabled')) return this.pressed;
      this.pressed = force === undefined ? !this.pressed : !!force;
      return this.pressed;
    }
    changed(): void { this._sync?.(); }
    mount(): void {
      const root = make('span', 'usa-moment usa-groove');
      const key = make('button', 'usa-groove-key');
      key.type = 'button';
      const mark = make('span', 'usa-groove-mark');
      mark.setAttribute('aria-hidden', 'true');
      key.append(mark);
      root.append(key);
      this.append(root);
      const sync = () => {
        key.setAttribute('aria-label', this.str('label', 'Pin'));
        key.setAttribute('aria-pressed', String(this.pressed));
        root.toggleAttribute('data-on', this.pressed);
        root.toggleAttribute('data-static', this.reduced);
        key.disabled = this.flag('disabled');
      };
      this._sync = sync;
      this.listen(key, 'click', () => {
        if (this.flag('disabled')) return;
        this.emit('change', { pressed: this.toggle() });
      });
      this.onCleanup(() => { root.remove(); this._sync = undefined; });
      sync();
    }
  }, { id: 'moment-ui', text: css });
  defineMoName(tag, ctor);
  return ctor;
}
