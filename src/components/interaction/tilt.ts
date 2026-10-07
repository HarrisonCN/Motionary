import { defineElement, raf, caf, clamp, type UsaElement } from '../base';
import css from './tilt.css?raw';

/**
 * `<usa-tilt>` — a 3D card that tilts toward the pointer, with an optional
 * glare highlight that follows it.
 *
 * Attributes: `max` (deg, 10), `scale` (1.03 while hovered), `perspective`
 * (px, 900), `glare` (add the light reflection), `reverse` (tilt away),
 * `disabled`. Off under reduced motion. Exposes `--usa-tilt-x` /
 * `--usa-tilt-y` (−1…1) for parallax layers inside the card.
 */
export type UsaTiltElement = UsaElement;

export function defineTilt(tag = 'usa-tilt'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaTilt extends Base {
        static get observedAttributes(): string[] {
          return ['max', 'scale', 'perspective', 'glare', 'reverse', 'disabled'];
        }

        private _frame = 0;
        private _glare: HTMLElement | null = null;

        mount(): void {
          if (this.flag('glare') && !this._glare) {
            this._glare = document.createElement('span');
            this._glare.className = 'usa-tilt-glare';
            this._glare.setAttribute('aria-hidden', 'true');
            this.append(this._glare);
          } else if (!this.flag('glare') && this._glare) {
            this._glare.remove();
            this._glare = null;
          }
          if (this.reduced || this.flag('disabled')) return;
          const max = this.num('max', 10) * (this.flag('reverse') ? -1 : 1);
          const scale = this.num('scale', 1.03);
          const persp = this.num('perspective', 900);
          let px = 0.5;
          let py = 0.5;
          let rect: DOMRect | null = null;
          const apply = () => {
            this._frame = 0;
            const nx = clamp(px * 2 - 1, -1, 1);
            const ny = clamp(py * 2 - 1, -1, 1);
            this.style.transform = `perspective(${persp}px) rotateX(${(-ny * max).toFixed(2)}deg) rotateY(${(nx * max).toFixed(2)}deg) scale(${scale})`;
            this.style.setProperty('--usa-tilt-x', nx.toFixed(3));
            this.style.setProperty('--usa-tilt-y', ny.toFixed(3));
            this.style.setProperty('--usa-glare-x', `${(px * 100).toFixed(1)}%`);
            this.style.setProperty('--usa-glare-y', `${(py * 100).toFixed(1)}%`);
          };
          this.listen(this, 'pointerenter', (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            rect = this.getBoundingClientRect();
            this.setAttribute('data-active', '');
          });
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            rect = rect || this.getBoundingClientRect();
            px = (e.clientX - rect.left) / (rect.width || 1);
            py = (e.clientY - rect.top) / (rect.height || 1);
            if (!this._frame) this._frame = raf(apply);
          });
          this.listen(this, 'pointerleave', () => this.reset());
        }

        private reset(): void {
          caf(this._frame);
          this._frame = 0;
          this.removeAttribute('data-active');
          this.style.transform = '';
          this.style.setProperty('--usa-tilt-x', '0');
          this.style.setProperty('--usa-tilt-y', '0');
        }

        unmount(): void {
          this.reset();
        }
      },
    { id: 'tilt', text: css }
  );
}
