import { defineElement, clamp, type UsaElement } from '../base';
import { createSpring, type SpringValue } from '../physics/spring';
import { gesture } from './core';
import css from './gesture.css?raw';

/**
 * `<usa-pinch-zoom>` — pinch (two fingers or Ctrl/⌘ + wheel / trackpad
 * pinch) to zoom its content, pan while zoomed, double-tap to toggle zoom;
 * scale and position spring back inside the bounds on release.
 *
 * Attributes: `min` (1), `max` (4), `double-tap` (zoom level, 2), `preset`.
 * Keyboard: `+` / `-` / `0`. Property `scale`, method `zoomTo(scale)`.
 * Event `usa:zoom` (`{ scale }`). Reduced motion: zoom changes instantly.
 */
export interface UsaPinchZoomElement extends UsaElement {
  readonly scale: number;
  zoomTo(scale: number): void;
}

export function definePinchZoom(tag = 'usa-pinch-zoom'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaPinchZoom extends Base {
        private _k!: SpringValue;
        private _x!: SpringValue;
        private _y!: SpringValue;
        private _v = { k: 1, x: 0, y: 0 };

        get scale(): number {
          return this._v.k;
        }

        private paint(): void {
          const { k, x, y } = this._v;
          this.style.setProperty('--usa-zoom', String(k));
          this.style.setProperty('--usa-zoom-x', `${x}px`);
          this.style.setProperty('--usa-zoom-y', `${y}px`);
          this.toggleAttribute('data-zoomed', k > 1.01);
        }

        private bound(k: number, x: number, y: number) {
          const w = (this.clientWidth * (k - 1)) / 2;
          const h = (this.clientHeight * (k - 1)) / 2;
          return { x: clamp(x, -w, w), y: clamp(y, -h, h) };
        }

        zoomTo(scale: number): void {
          const k = clamp(scale, this.num('min', 1), this.num('max', 4));
          const b = this.bound(k, this._v.x, this._v.y);
          if (this.reduced) {
            this._v = { k, ...b };
            this.paint();
          } else {
            this._k.set(k);
            this._x.set(b.x);
            this._y.set(b.y);
          }
          this.emit('zoom', { scale: k });
        }

        mount(): void {
          const preset = this.str('preset', 'gentle');
          this._k = createSpring({ spring: preset, value: this._v.k, onUpdate: (v) => ((this._v.k = v), this.paint()) });
          this._x = createSpring({ spring: preset, value: this._v.x, onUpdate: (v) => ((this._v.x = v), this.paint()) });
          this._y = createSpring({ spring: preset, value: this._v.y, onUpdate: (v) => ((this._v.y = v), this.paint()) });
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          let base = 1;
          let ox = 0;
          let oy = 0;
          this.onCleanup(
            gesture(this, {
              onPinch: ({ scale, first, last }) => {
                if (first) base = this._v.k;
                const k = clamp(base * scale, this.num('min', 1) * 0.7, this.num('max', 4) * 1.3);
                if (last) return this.zoomTo(k);
                this._k.jump(k);
              },
              onPan: ({ dx, dy, vx, vy, first, last }) => {
                if (this._v.k <= 1.01) return;
                if (first) ((ox = this._v.x), (oy = this._v.y));
                if (!last) {
                  this._x.jump(ox + dx);
                  this._y.jump(oy + dy);
                  return;
                }
                const b = this.bound(this._v.k, ox + dx + vx * 0.15, oy + dy + vy * 0.15);
                this._x.set(b.x, vx);
                this._y.set(b.y, vy);
              },
              onDoubleTap: () => this.zoomTo(this._v.k > 1.01 ? 1 : this.num('double-tap', 2)),
            })
          );
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === '+' || e.key === '=') this.zoomTo(this._v.k * 1.25);
            else if (e.key === '-') this.zoomTo(this._v.k / 1.25);
            else if (e.key === '0') this.zoomTo(1);
            else return;
            e.preventDefault();
          });
          this.paint();
        }

        unmount(): void {
          [this._k, this._x, this._y].forEach((s) => s?.stop());
        }
      },
    { id: 'gesture', text: css }
  );
}
