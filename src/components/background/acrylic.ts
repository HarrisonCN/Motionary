import { defineElement, type UsaElement } from '../base';
import css from './acrylic.css?raw';

/**
 * `<usa-acrylic>` — Windows Fluent materials for the web: `acrylic`
 * (frosted glass: backdrop blur + saturation + tint + subtle noise) and
 * `mica` (an opaque, wallpaper-tinted base for app backgrounds; on the web it
 * tints from `--usa-mica-source`, a gradient you control). Optional
 * `shimmer` adds a light sweep when it appears or on hover.
 *
 * Attributes: `kind` (`acrylic` default | `mica`; `variant` is a deprecated alias until 3.0), `tint` (colour),
 * `tint-opacity` (0–1, 0.55), `blur` (px, 30), `shimmer`
 * (`hover` | `load` | `none`, default `none`). Falls back to a solid tint
 * without `backdrop-filter` and under `prefers-reduced-transparency` or
 * forced colours, like Windows does when transparency effects are off.
 */
export type UsaAcrylicElement = UsaElement;

export function defineAcrylic(tag = 'usa-acrylic'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaAcrylic extends Base {
        static get observedAttributes(): string[] {
          return ['tint', 'tint-opacity', 'blur', 'shimmer'];
        }

        mount(): void {
          const tint = this.getAttribute('tint');
          if (tint) this.style.setProperty('--usa-acrylic-tint', tint);
          else this.style.removeProperty('--usa-acrylic-tint');
          this.style.setProperty('--usa-acrylic-opacity', `${Math.round(this.num('tint-opacity', 0.55) * 100)}%`);
          this.style.setProperty('--usa-acrylic-blur', `${this.num('blur', 30)}px`);
          if (this.str('shimmer') === 'load' && !this.reduced) {
            this.removeAttribute('data-shine');
            void this.offsetWidth;
            this.setAttribute('data-shine', '');
          }
        }
      },
    { id: 'acrylic', text: css }
  );
}
