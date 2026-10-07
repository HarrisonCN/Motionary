import { defineElement, raf, caf, type UsaElement } from '../base';
import css from './magnetic.css?raw';

/**
 * `<usa-magnetic>` — its content leans toward the pointer when the pointer
 * comes near, and springs back when it leaves (great for CTAs and icons).
 *
 * Attributes: `strength` (0–1 share of the pointer offset, 0.35), `radius`
 * (px of attraction beyond the element's edge, 60), `disabled`. Only on
 * devices with a fine pointer that hovers; off under reduced motion.
 * Writes one `transform` per frame through `--usa-mx` / `--usa-my`.
 */
export type UsaMagneticElement = UsaElement;

export function defineMagnetic(tag = 'usa-magnetic'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaMagnetic extends Base {
        static get observedAttributes(): string[] {
          return ['strength', 'radius', 'disabled'];
        }

        private _frame = 0;

        mount(): void {
          if (this.reduced || this.flag('disabled')) return;
          if (typeof matchMedia === 'function' && !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
          const strength = this.num('strength', 0.35);
          const radius = this.num('radius', 60);
          let x = 0;
          let y = 0;
          let active = false;
          const apply = () => {
            this._frame = 0;
            const r = this.getBoundingClientRect();
            const dx = x - (r.left + r.width / 2);
            const dy = y - (r.top + r.height / 2);
            const near = Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
            if (near) {
              active = true;
              this.setAttribute('data-active', '');
              this.style.setProperty('--usa-mx', `${(dx * strength).toFixed(2)}px`);
              this.style.setProperty('--usa-my', `${(dy * strength).toFixed(2)}px`);
            } else if (active) this.release();
          };
          this.listen(
            document,
            'pointermove',
            (e: PointerEvent) => {
              if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
              x = e.clientX;
              y = e.clientY;
              if (!this._frame) this._frame = raf(apply);
            },
            { passive: true }
          );
          this.listen(document, 'pointerleave', () => this.release());
          this.listen(window, 'blur', () => this.release());
        }

        private release(): void {
          this.removeAttribute('data-active');
          this.style.removeProperty('--usa-mx');
          this.style.removeProperty('--usa-my');
        }

        unmount(): void {
          caf(this._frame);
          this._frame = 0;
          this.release();
        }
      },
    { id: 'magnetic', text: css }
  );
}
