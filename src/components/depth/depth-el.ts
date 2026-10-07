import { defineElement, raf, caf, clamp, type UsaElement } from '../base';
import { deviceTilt, requestOrientationPermission, supportsOrientation } from './core';
import css from './depth.css?raw';

/**
 * `<usa-depth>` — depth parallax: children with `data-depth` (-1…1, 0 = the
 * screen plane) move and scale by depth as the pointer moves, the device
 * tilts (`orientation`) or the page scrolls (`scroll`).
 * Attributes: `source` (`pointer` default · `orientation` · `scroll` ·
 * space-separated mix), `strength` (px at depth 1, 40), `rotate` (max tilt
 * of the whole scene in deg, 0). `requestPermission()` for iOS motion.
 * Reduced motion: layers stay flat.
 */
export interface UsaDepthElement extends UsaElement {
  /** Current -1…1 input. */
  readonly tilt: { x: number; y: number };
  requestPermission(): Promise<boolean>;
}

export function defineDepth(tag = 'usa-depth'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaDepth extends Base {
        static get observedAttributes(): string[] {
          return ['source', 'strength', 'rotate'];
        }
        private _t = { x: 0, y: 0 };
        private _id = 0;

        get tilt(): { x: number; y: number } {
          return { ...this._t };
        }

        requestPermission(): Promise<boolean> {
          return requestOrientationPermission().then((ok) => {
            if (ok) {
              this.changed('source');
            }
            return ok;
          });
        }

        private apply(): void {
          this._id = 0;
          const s = this.num('strength', 40);
          const r = this.num('rotate', 0);
          const { x, y } = this._t;
          this.style.setProperty('--usa-depth-x', x.toFixed(4));
          this.style.setProperty('--usa-depth-y', y.toFixed(4));
          if (r) this.style.setProperty('--usa-depth-rot', `rotateX(${(-y * r).toFixed(2)}deg) rotateY(${(x * r).toFixed(2)}deg)`);
          this.querySelectorAll<HTMLElement>('[data-depth]').forEach((el) => {
            const d = clamp(Number(el.dataset.depth) || 0, -1, 1);
            el.style.transform = `translate3d(${(x * d * s).toFixed(2)}px, ${(y * d * s).toFixed(2)}px, 0) scale(${(1 + d * 0.04).toFixed(4)})`;
          });
        }

        private set(x: number, y: number): void {
          this._t = { x: clamp(x, -1, 1), y: clamp(y, -1, 1) };
          if (!this._id) this._id = raf(() => this.apply());
        }

        mount(): void {
          if (this.reduced) return;
          const src = this.str('source', 'pointer').split(/\s+/);
          if (src.includes('pointer')) {
            this.listen(this, 'pointermove', (e: PointerEvent) => {
              const r = this.getBoundingClientRect();
              this.set(((e.clientX - r.left) / (r.width || 1)) * 2 - 1, ((e.clientY - r.top) / (r.height || 1)) * 2 - 1);
            });
            this.listen(this, 'pointerleave', () => this.set(0, 0));
          }
          if (src.includes('orientation') && supportsOrientation()) this.onCleanup(deviceTilt((t) => this.set(t.x, t.y)));
          if (src.includes('scroll')) {
            const on = () => {
              const r = this.getBoundingClientRect();
              const vh = window.innerHeight || 1;
              this.set(this._t.x, clamp(((r.top + r.height / 2) / vh) * 2 - 1, -1, 1));
            };
            this.listen(window, 'scroll', on, { passive: true });
            on();
          }
          this.onCleanup(() => {
            caf(this._id);
            this._id = 0;
          });
        }

        unmount(): void {
          this._t = { x: 0, y: 0 };
          this.querySelectorAll<HTMLElement>('[data-depth]').forEach((el) => (el.style.transform = ''));
        }
      },
    { id: 'depth', text: css }
  );
}
