import { defineElement, queryAttr, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { glyph, morphGlyph, luminousTheme } from './luminous-shared';
import shared from './luminous.css?raw';
import css from './luminous-switch.css?raw';

/** `<mo-luminous-switch>` — a glass day/night switch with a sliding halo and particle sun/moon morph.
 * `checked` is reflected; optional `target` receives data-usa-surface=light/dark. No page theme is changed without target.
 * Native button keyboard semantics; `name`/`value` participate in forms, including reset. `usa:change` { checked, theme }.
 */
export interface UsaLuminousSwitchElement extends UsaElement {
  checked: boolean;
  toggle(force?: boolean): void;
}
export function defineLuminousSwitch(tag = 'usa-luminous-switch'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class LuminousSwitch extends Base {
      static get observedAttributes(): string[] { return ['checked', 'disabled', 'label', 'name', 'value', 'target', 'theme']; }
      private _button?: HTMLButtonElement;
      private _svg?: SVGSVGElement;
      private _input?: HTMLInputElement;
      private _initial = false;
      private _hadInitial = false;
      get checked(): boolean { return this.flag('checked'); }
      set checked(value: boolean) { this.toggleAttribute('checked', !!value); }
      toggle(force?: boolean): void { this.checked = force ?? !this.checked; }
      changed(name: string): void { if (name === 'checked' || name === 'disabled') this.sync(name === 'checked'); else super.changed(name); }
      mount(): void {
        luminousTheme(this);
        if (!this._hadInitial) { this._initial = this.checked; this._hadInitial = true; }
        this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'usa-ls-track usa-lu-surface'; b.setAttribute('role', 'switch'); b.setAttribute('data-usa-part', '');
        const thumb = document.createElement('span'); thumb.className = 'usa-ls-thumb usa-lu-glass';
        this._svg = glyph(this); thumb.append(this._svg); b.append(thumb); this.prepend(b); this._button = b;
        const input = document.createElement('input'); input.type = 'hidden'; input.setAttribute('data-usa-part', ''); this.append(input); this._input = input;
        this.sync(false);
        this.listen(b, 'click', () => { if (this.flag('disabled')) return; this.toggle(); this.emit('change', { checked: this.checked, theme: this.checked ? 'light' : 'dark' }); });
        const form = this.closest('form');
        if (form) this.listen(form, 'reset', (e: Event) => { queueMicrotask(() => { if (!e.defaultPrevented && this.isConnected) this.checked = this._initial; }); });
      }
      private sync(animate: boolean): void {
        if (!this._button || !this._svg) return;
        const checked = this.checked;
        this._button.disabled = this.flag('disabled');
        this._button.setAttribute('aria-checked', String(checked));
        this._button.setAttribute('aria-label', this.str('label', 'Light theme'));
        this.toggleAttribute('data-on', checked); this.toggleAttribute('data-lu-reduced', this.reduced);
        this.dataset.luTheme = checked ? 'light' : 'dark';
        morphGlyph(this._svg, checked ? 'sun' : 'moon', animate, this);
        if (this._input) { this._input.name = this.str('name'); this._input.value = this.str('value', 'on'); this._input.disabled = !checked || this.flag('disabled') || !this._input.name; }
        if (this.str('target')) queryAttr(this.str('target'))?.setAttribute('data-usa-surface', checked ? 'light' : 'dark');
      }
    }
    return LuminousSwitch;
  }, { id: 'luminous-switch', text: shared + css });
  defineMoName(tag, ctor); return ctor;
}
