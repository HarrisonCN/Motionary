import { defineElement, raf, caf, now, type UsaElement } from '../base';
import { createSpring, type SpringValue } from '../physics/spring';
import css from './magnetic.css?raw';

/**
 * `<usa-magnetic>` — its content leans toward the pointer when the pointer
 * comes near, and springs back when it leaves (great for CTAs and icons).
 *
 * Attributes: `strength` (0–1 share of the pointer offset, 0.35), `radius`
 * (px of attraction beyond the element's edge, 60), `disabled`. Only on
 * devices with a fine pointer that hovers; off under reduced motion.
 * Writes one `transform` per frame through `--usa-mx` / `--usa-my`.
 *
 * 17.9: `release="spring"` — when the pointer leaves, the content springs home from where it was, carrying the speed
 * the pointer left with (a fast exit overshoots a little and settles, a slow one glides back). The default (`ease`)
 * keeps the CSS transition.
 */
export type UsaMagneticElement = UsaElement;

export function defineMagnetic(tag = 'usa-magnetic'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaMagnetic extends Base {
        static get observedAttributes(): string[] {
          return ['strength', 'radius', 'disabled', 'release'];
        }

        private _frame = 0;
        private _off = { x: 0, y: 0 };
        private _vel = { x: 0, y: 0 };
        private _springs?: [SpringValue, SpringValue];

        mount(): void {
          if (this.reduced || this.flag('disabled')) return;
          if (typeof matchMedia === 'function' && !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
          const strength = this.num('strength', 0.35);
          const radius = this.num('radius', 60);
          let x = 0;
          let y = 0;
          let at = 0;
          let active = false;
          const apply = () => {
            this._frame = 0;
            const r = this.getBoundingClientRect();
            const dx = x - (r.left + r.width / 2);
            const dy = y - (r.top + r.height / 2);
            const near = Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
            if (near) {
              active = true;
              if (this._springs) this.settle();
              this.setAttribute('data-active', '');
              this._off = { x: dx * strength, y: dy * strength };
              this.style.setProperty('--usa-mx', `${(dx * strength).toFixed(2)}px`);
              this.style.setProperty('--usa-my', `${(dy * strength).toFixed(2)}px`);
            } else if (active) {
              active = false;
              this.release(this.str('release') === 'spring');
            }
          };
          this.listen(
            document,
            'pointermove',
            (e: PointerEvent) => {
              if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
              const t = now(), dt = Math.max(8, t - at) / 1000;
              if (at) this._vel = { x: (e.clientX - x) / dt, y: (e.clientY - y) / dt };
              at = t;
              x = e.clientX;
              y = e.clientY;
              if (!this._frame) this._frame = raf(apply);
            },
            { passive: true }
          );
          this.listen(document, 'pointerleave', () => this.release());
          this.listen(window, 'blur', () => this.release());
        }

        private release(spring = false): void {
          caf(this._frame);
          this._frame = 0;
          this.removeAttribute('data-active');
          const { x, y } = this._off;
          this._off = { x: 0, y: 0 };
          if (spring && !this.reduced && (x || y)) {
            // the pointer's exit speed, scaled like the offset and capped so a flick cannot throw the content away
            const cap = 1600, k = this.num('strength', 0.35);
            const vx = Math.max(-cap, Math.min(cap, this._vel.x * k)), vy = Math.max(-cap, Math.min(cap, this._vel.y * k));
            this.settle();
            this.setAttribute('data-releasing', '');
            const write = () => {
              const [sx, sy] = this._springs!;
              this.style.setProperty('--usa-mx', `${sx.value.toFixed(2)}px`);
              this.style.setProperty('--usa-my', `${sy.value.toFixed(2)}px`);
            };
            const rest = () => { if (this._springs && !this._springs[0].animating && !this._springs[1].animating) this.settle(); };
            const cfg = { stiffness: 240, damping: 13, mass: 1 };
            this._springs = [
              createSpring({ value: x, spring: cfg, onUpdate: write, onRest: rest }),
              createSpring({ value: y, spring: cfg, onUpdate: write, onRest: rest }),
            ];
            this._springs[0].set(0, vx);
            this._springs[1].set(0, vy);
            return;
          }
          this.settle();
        }

        /** Stop a spring release and clear the offset. */
        private settle(): void {
          if (this._springs) {
            this._springs.forEach((s) => s.stop());
            this._springs = undefined;
          }
          this.removeAttribute('data-releasing');
          this.style.removeProperty('--usa-mx');
          this.style.removeProperty('--usa-my');
        }

        unmount(): void {
          this.release();
        }
      },
    { id: 'magnetic', text: css }
  );
}
