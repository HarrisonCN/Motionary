import { defineElement, clamp, type UsaElement } from '../base';
import { pinchAngle, pinchScale } from '../fx2/gesture3';
import css from './gesture-sticker.css?raw';

/**
 * `<usa-gesture-sticker>` (8.7) — a multi-touch sticker: drag it with one
 * finger, pinch with two to scale and twist to rotate (all at once), with a
 * springy settle and a lifted shadow while held. Mouse: drag, wheel scales,
 * Shift + wheel rotates. Keyboard: arrows move, + / − scale, [ / ] rotate,
 * 0 resets. `min` / `max` scale; `x`, `y`, `scale`, `angle`;
 * `transformTo({ x, y, scale, angle })`, `reset()`; `usa:transform`.
 * A focusable `img`-like `group`; reduced motion: no spring.
 */
export interface StickerState {
  x: number;
  y: number;
  scale: number;
  angle: number;
}
export interface UsaGestureStickerElement extends UsaElement, StickerState {
  transformTo(s: Partial<StickerState>): void;
  reset(): void;
}

export function defineGestureSticker(tag = 'usa-gesture-sticker'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaGestureSticker extends Base {
        static get observedAttributes(): string[] {
          return ['min', 'max', 'label'];
        }
        private _st: StickerState = { x: 0, y: 0, scale: 1, angle: 0 };
        get x(): number {
          return this._st.x;
        }
        get y(): number {
          return this._st.y;
        }
        get scale(): number {
          return this._st.scale;
        }
        get angle(): number {
          return this._st.angle;
        }
        mount(): void {
          this.setAttribute('role', 'group');
          this.setAttribute('aria-roledescription', 'sticker');
          this.setAttribute('aria-label', `${this.str('label', 'Sticker')} — drag, pinch or twist; arrows, + / −, [ / ] on the keyboard`);
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          const pts = new Map<number, { x: number; y: number }>();
          let start: { st: StickerState; a: { x: number; y: number }; b?: { x: number; y: number } } | null = null;
          const begin = () => {
            const v = [...pts.values()];
            start = v.length ? { st: { ...this._st }, a: v[0], b: v[1] } : null;
            this.setFlag('data-held', v.length > 0);
          };
          this.listen(this, 'pointerdown', (e: PointerEvent) => {
            pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
            try {
              this.setPointerCapture?.(e.pointerId);
            } catch {
              /* synthetic */
            }
            begin();
          });
          this.listen(this, 'pointermove', (e: PointerEvent) => {
            if (!pts.has(e.pointerId) || !start) return;
            pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
            const v = [...pts.values()];
            const s0 = start.st;
            if (v.length >= 2 && start.b) {
              const mx = (v[0].x + v[1].x - start.a.x - start.b.x) / 2;
              const my = (v[0].y + v[1].y - start.a.y - start.b.y) / 2;
              this.set({ x: s0.x + mx, y: s0.y + my, scale: s0.scale * pinchScale(start.a, start.b, v[0], v[1]), angle: s0.angle + pinchAngle(start.a, start.b, v[0], v[1]) }, false);
            } else this.set({ ...s0, x: s0.x + v[0].x - start.a.x, y: s0.y + v[0].y - start.a.y }, false);
          });
          const up = (e: PointerEvent) => {
            pts.delete(e.pointerId);
            begin();
            if (!pts.size) this.settle();
          };
          this.listen(this, 'pointerup', up);
          this.listen(this, 'pointercancel', up);
          this.listen(this, 'wheel', (e: WheelEvent) => {
            e.preventDefault();
            if (e.shiftKey) this.set({ ...this._st, angle: this._st.angle + (e.deltaY > 0 ? 8 : -8) }, true);
            else this.set({ ...this._st, scale: this._st.scale * (e.deltaY < 0 ? 1.1 : 1 / 1.1) }, true);
          }, { passive: false });
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const s = { ...this._st };
            const k = e.key;
            if (k === 'ArrowLeft') s.x -= 10;
            else if (k === 'ArrowRight') s.x += 10;
            else if (k === 'ArrowUp') s.y -= 10;
            else if (k === 'ArrowDown') s.y += 10;
            else if (k === '+' || k === '=') s.scale *= 1.15;
            else if (k === '-') s.scale /= 1.15;
            else if (k === '[') s.angle -= 15;
            else if (k === ']') s.angle += 15;
            else if (k === '0') return void (e.preventDefault(), this.reset());
            else return;
            e.preventDefault();
            this.set(s, true);
          });
          this.set(this._st, false, true);
        }
        private settle(): void {
          if (this.reduced) return;
          this.motion(this, [{ filter: 'brightness(1.08)' }, { filter: 'none' }], { duration: 300 });
        }
        private set(s: StickerState, ease: boolean, silent = false): void {
          const min = Math.max(0.1, this.num('min', 0.5));
          const max = Math.max(min, this.num('max', 3));
          const n = { x: Math.round(s.x * 10) / 10, y: Math.round(s.y * 10) / 10, scale: Math.round(clamp(s.scale, min, max) * 1000) / 1000, angle: Math.round((((s.angle % 360) + 540) % 360 - 180) * 10) / 10 };
          this._st = n;
          this.style.transition = ease && !this.reduced ? 'transform .35s cubic-bezier(.3,1.4,.5,1)' : 'none';
          this.style.transform = `translate(${n.x}px,${n.y}px) rotate(${n.angle}deg) scale(${n.scale})`;
          if (!silent) this.emit('transform', { ...n });
        }
        transformTo(s: Partial<StickerState>): void {
          this.set({ ...this._st, ...s }, true);
        }
        reset(): void {
          this.set({ x: 0, y: 0, scale: 1, angle: 0 }, true);
        }
      }
      return UsaGestureSticker as unknown as CustomElementConstructor;
    },
    { id: 'gesture-sticker', text: css }
  );
}
