import { defineElement, type UsaElement } from '../base';
import css from './grain.css?raw';

/**
 * `<usa-grain>` — a film-grain / noise overlay on top of its content
 * (SVG `feTurbulence` texture, no images to ship). With `animated`, the
 * grain jitters like film (stepped `transform`, ~12 fps).
 *
 * Attributes: `opacity` (0.12), `animated`, `blend` (`mix-blend-mode`,
 * default `overlay`), `scale` (texture size px, 180). Never intercepts
 * pointer events. Reduced motion: static grain.
 */
export type UsaGrainElement = UsaElement;

const noise = (freq: number) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1.6 -0.3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function defineGrain(tag = 'usa-grain'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaGrain extends Base {
        static get observedAttributes(): string[] {
          return ['opacity', 'blend', 'scale'];
        }

        private _layer: HTMLElement | null = null;

        mount(): void {
          if (!this._layer) {
            this._layer = document.createElement('div');
            this._layer.className = 'usa-grain-layer';
            this._layer.setAttribute('aria-hidden', 'true');
            this.append(this._layer);
          }
          const s = this._layer.style;
          s.backgroundImage = noise(0.8);
          s.backgroundSize = `${this.num('scale', 180)}px`;
          s.opacity = String(this.num('opacity', 0.12));
          s.mixBlendMode = this.str('blend', 'overlay');
        }
      },
    { id: 'grain', text: css }
  );
}
