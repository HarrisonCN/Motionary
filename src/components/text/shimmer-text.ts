import { defineElement, type UsaElement } from '../base';
import css from './shimmer-text.css?raw';

/**
 * `<usa-shimmer-text>` — a light sweep across gradient-filled text (CSS
 * only; the element just maps attributes to custom properties).
 *
 * Attributes: `duration` (ms, 2600), `color` (base text colour), `shine`
 * (highlight colour), `angle` (deg, 110). Or style `--usa-shimmer-*`
 * directly. Reduced motion: static gradient text.
 */
export type UsaShimmerTextElement = UsaElement;

export function defineShimmerText(tag = 'usa-shimmer-text'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaShimmerText extends Base {
        static get observedAttributes(): string[] {
          return ['duration', 'color', 'shine', 'angle'];
        }

        mount(): void {
          const set = (attr: string, prop: string, unit = '') => {
            const v = this.getAttribute(attr);
            if (v !== null) this.style.setProperty(prop, v + unit);
            else this.style.removeProperty(prop);
          };
          set('duration', '--usa-shimmer-duration', 'ms');
          set('color', '--usa-shimmer-color');
          set('shine', '--usa-shimmer-shine');
          set('angle', '--usa-shimmer-angle', 'deg');
        }
      },
    { id: 'shimmer-text', text: css }
  );
}
