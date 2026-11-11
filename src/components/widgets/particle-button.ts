import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { glyph, morphGlyph, luminousTheme } from './luminous-shared';
import shared from './luminous.css?raw';
import css from './particle-button.css?raw';

/** `<mo-particle-button label="Save" icon="spark" active-icon="check">` — glass action/toggle button with a particle burst.
 * `toggle` enables reflected `pressed`/aria-pressed; otherwise it is an ordinary action button. `usa:activate` { pressed }.
 */
export interface UsaParticleButtonElement extends UsaElement {
  pressed: boolean;
  activate(): void;
}
export function defineParticleButton(tag = 'usa-particle-button'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class ParticleButton extends Base {
      static get observedAttributes(): string[] { return ['label', 'icon', 'active-icon', 'toggle', 'pressed', 'disabled', 'theme']; }
      private _button?: HTMLButtonElement;
      private _svg?: SVGSVGElement;
      get pressed(): boolean { return this.flag('pressed'); }
      set pressed(v: boolean) { this.toggleAttribute('pressed', !!v); }
      changed(name: string): void { if (name === 'pressed' || name === 'disabled') this.sync(true); else super.changed(name); }
      activate(): void {
        if (this.flag('disabled')) return;
        if (this.flag('toggle')) this.pressed = !this.pressed; else this.sync(true);
        this.emit('activate', { pressed: this.pressed });
      }
      mount(): void {
        luminousTheme(this); this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
        const b = document.createElement('button'); b.type = 'button'; b.className = 'usa-pb-button usa-lu-glass'; b.setAttribute('data-usa-part', '');
        this._svg = glyph(this); b.append(this._svg);
        const text = document.createElement('span'); text.textContent = this.str('label', 'Activate'); b.append(text);
        this._button = b; this.prepend(b); this.sync(false);
        this.listen(b, 'click', () => this.activate());
      }
      private sync(animate: boolean): void {
        if (!this._button || !this._svg) return;
        this._button.disabled = this.flag('disabled');
        if (this.flag('toggle')) this._button.setAttribute('aria-pressed', String(this.pressed)); else this._button.removeAttribute('aria-pressed');
        this.toggleAttribute('data-lu-reduced', this.reduced);
        morphGlyph(this._svg, this.pressed ? this.str('active-icon', 'check') : this.str('icon', 'spark'), animate, this);
      }
    }
    return ParticleButton;
  }, { id: 'particle-button', text: shared + css });
  defineMoName(tag, ctor); return ctor;
}
