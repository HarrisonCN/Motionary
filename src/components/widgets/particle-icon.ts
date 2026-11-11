import { defineElement, type UsaElement } from '../base';
import { defineMoName } from './mo-name';
import { glyph, morphGlyph, luminousTheme } from './luminous-shared';
import shared from './luminous.css?raw';

/** `<mo-particle-icon icon="moon">` — 64 SVG particles morph between sun, moon, check, heart, play, pause, spark and power.
 * Set `icon` or call morph(name). A labelled image; `decorative` hides it from assistive technology. No idle animation.
 */
export interface UsaParticleIconElement extends UsaElement {
  icon: string;
  morph(name: string): void;
}
export function defineParticleIcon(tag = 'usa-particle-icon'): CustomElementConstructor | undefined {
  const ctor = defineElement(tag, Base => {
    class ParticleIcon extends Base {
      static get observedAttributes(): string[] { return ['icon', 'label', 'decorative', 'theme']; }
      private _svg?: SVGSVGElement;
      get icon(): string { return this.str('icon', 'moon'); }
      set icon(v: string) { this.setAttribute('icon', v); }
      morph(name: string): void { this.icon = name; }
      changed(name: string): void { if (name === 'icon') this.sync(true); else super.changed(name); }
      mount(): void {
        luminousTheme(this);
        this.querySelectorAll(':scope > [data-usa-part]').forEach(n => n.remove());
        this._svg = glyph(this); this._svg.setAttribute('data-usa-part', ''); this.append(this._svg);
        this.sync(false);
      }
      private sync(animate: boolean): void {
        this.setAttribute('role', 'img');
        this.setAttribute('aria-label', this.str('label', this.icon));
        this.setAttribute('aria-hidden', String(this.flag('decorative')));
        if (this._svg) morphGlyph(this._svg, this.icon, animate, this);
      }
    }
    return ParticleIcon;
  }, { id: 'particle-icon', text: shared + ':is(mo-particle-icon,usa-particle-icon){width:var(--mo-icon-size,56px);height:var(--mo-icon-size,56px);vertical-align:middle}' });
  defineMoName(tag, ctor); return ctor;
}
