import { defineElement, type UsaElement } from '../base';
import css from './aurora.css?raw';

/**
 * `<usa-aurora>` — a slow, drifting aurora / gradient-mesh backdrop behind
 * its content. Soft radial gradients moved with `transform` only (no
 * animated blur), paused while off-screen.
 *
 * Attributes: `colors` (comma-separated, default violet / cyan / pink),
 * `speed` (multiplier, 1), `intensity` (0–1 opacity, 0.7), `paused`.
 * Reduced motion: a still gradient.
 */
export type UsaAuroraElement = UsaElement;

export function defineAurora(tag = 'usa-aurora'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaAurora extends Base {
        static get observedAttributes(): string[] {
          return ['colors', 'speed', 'intensity'];
        }

        private _layer: HTMLElement | null = null;

        mount(): void {
          if (!this._layer) {
            this._layer = document.createElement('div');
            this._layer.className = 'usa-aurora-layer';
            this._layer.setAttribute('aria-hidden', 'true');
            this._layer.innerHTML = '<i></i><i></i><i></i><i></i>';
            this.prepend(this._layer);
          }
          const colors = this.str('colors', '#7c5cff,#22d3ee,#f472b6,#34d399').split(',').map((c) => c.trim()).filter(Boolean);
          Array.from(this._layer.children).forEach((blob, i) => {
            (blob as HTMLElement).style.setProperty('--c', colors[i % colors.length]);
          });
          const speed = this.num('speed', 1);
          this.style.setProperty('--usa-aurora-speed', `${(18 / Math.max(0.05, speed)).toFixed(2)}s`);
          this.style.setProperty('--usa-aurora-opacity', String(this.num('intensity', 0.7)));
          this.inView((v) => this.toggleAttribute('data-offscreen', !v));
        }
      },
    { id: 'aurora', text: css }
  );
}
