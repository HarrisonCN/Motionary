import { defineElement, clamp, type UsaElement } from '../base';
import { createSpring, projectInertia, snapTo, rubberBand, type SpringValue } from './spring';
import css from './draggable.css?raw';

/**
 * `<usa-draggable>` — drag its content with the pointer (mouse, touch, pen)
 * or the arrow keys; physics on release.
 *
 * Attributes: `axis` (`both` default, `x`, `y`), `spring-back` (return to
 * the origin with a spring), `inertia` (keep gliding after a flick),
 * `snap` (grid size like `80`, or points like `0,120,240`), `bounds`
 * (`parent` = stay inside the parent box, rubber-banding past its edges),
 * `preset` (spring, default `wobbly`), `step` (arrow-key step, px, 16),
 * `disabled`. Methods: `moveTo(x, y, animate?)`, `reset()`. Events:
 * `usa:drag-start`, `usa:drag-end` (`{ x, y, vx, vy }`), `usa:settle`.
 * Reduced motion: positions change instantly (no spring or inertia).
 */
export interface UsaDraggableElement extends UsaElement {
  readonly x: number;
  readonly y: number;
  readonly dragging: boolean;
  moveTo(x: number, y: number, animate?: boolean): void;
  reset(): void;
}

const parseSnap = (s: string): number | number[] | null => {
  if (!s.trim()) return null;
  const parts = s.split(',').map((p) => Number(p.trim())).filter((n) => Number.isFinite(n));
  if (!parts.length) return null;
  return s.includes(',') ? parts : parts[0];
};

export function defineDraggable(tag = 'usa-draggable'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaDraggable extends Base {
        static get observedAttributes(): string[] {
          return ['axis', 'disabled', 'preset'];
        }

        private _x = 0;
        private _y = 0;
        private _sx!: SpringValue;
        private _sy!: SpringValue;
        private _drag: { id: number; px: number; py: number; ox: number; oy: number; samples: [number, number, number][] } | null = null;

        get x(): number {
          return this._x;
        }
        get y(): number {
          return this._y;
        }
        get dragging(): boolean {
          return !!this._drag;
        }

        private render(): void {
          this.style.transform = `translate3d(${this._x}px, ${this._y}px, 0)`;
          this.style.setProperty('--usa-drag-x', `${this._x}px`);
          this.style.setProperty('--usa-drag-y', `${this._y}px`);
        }

        private axis(): string {
          return this.str('axis', 'both');
        }

        /** Bounds relative to the origin, from the parent box. */
        private limits(): { minX: number; maxX: number; minY: number; maxY: number } | null {
          if (this.str('bounds') !== 'parent' || !this.parentElement) return null;
          const p = this.parentElement.getBoundingClientRect();
          const r = this.getBoundingClientRect();
          const ox = r.left - this._x;
          const oy = r.top - this._y;
          return { minX: p.left - ox, maxX: p.right - ox - r.width, minY: p.top - oy, maxY: p.bottom - oy - r.height };
        }

        mount(): void {
          let settled = 0;
          const rest = () => {
            if (++settled >= 2) {
              settled = 0;
              this.removeAttribute('data-moving');
              this.emit('settle', { x: this._x, y: this._y });
            }
          };
          const spring = this.str('preset', 'wobbly');
          this._sx = createSpring({ value: this._x, spring, onUpdate: (v) => ((this._x = v), this.render()), onRest: rest });
          this._sy = createSpring({ value: this._y, spring, onUpdate: (v) => ((this._y = v), this.render()), onRest: rest });
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          this.setAttribute('aria-roledescription', 'draggable');
          this.listen(this, 'pointerdown', (e: PointerEvent) => this.start(e));
          this.listen(this, 'pointermove', (e: PointerEvent) => this.move(e));
          this.listen(this, 'pointerup', (e: PointerEvent) => this.end(e));
          this.listen(this, 'pointercancel', (e: PointerEvent) => this.end(e));
          this.listen(this, 'keydown', (e: KeyboardEvent) => this.key(e));
          this.render();
        }

        unmount(): void {
          this._sx?.stop();
          this._sy?.stop();
          this._drag = null;
        }

        private start(e: PointerEvent): void {
          if (this.flag('disabled') || (e.pointerType === 'mouse' && e.button !== 0)) return;
          this._sx.stop();
          this._sy.stop();
          this._drag = { id: e.pointerId, px: e.clientX, py: e.clientY, ox: this._x, oy: this._y, samples: [[e.clientX, e.clientY, typeof e.timeStamp === 'number' ? e.timeStamp : Date.now()]] };
          try {
            this.setPointerCapture?.(e.pointerId);
          } catch {
            /* synthetic events */
          }
          this.setAttribute('data-dragging', '');
          this.emit('drag-start', { x: this._x, y: this._y });
        }

        private move(e: PointerEvent): void {
          const d = this._drag;
          if (!d || e.pointerId !== d.id) return;
          const axis = this.axis();
          let x = axis === 'y' ? d.ox : d.ox + e.clientX - d.px;
          let y = axis === 'x' ? d.oy : d.oy + e.clientY - d.py;
          const b = this.limits();
          if (b) {
            const band = (v: number, lo: number, hi: number, dim: number) => (v < lo ? lo + rubberBand(v - lo, dim) : v > hi ? hi + rubberBand(v - hi, dim) : v);
            x = band(x, b.minX, b.maxX, 200);
            y = band(y, b.minY, b.maxY, 200);
          }
          this._x = x;
          this._y = y;
          d.samples.push([e.clientX, e.clientY, typeof e.timeStamp === 'number' ? e.timeStamp : Date.now()]);
          if (d.samples.length > 6) d.samples.shift();
          this.render();
          this.emit('drag', { x, y });
        }

        private velocity(): [number, number] {
          const s = this._drag?.samples || [];
          if (s.length < 2) return [0, 0];
          const a = s[0];
          const b = s[s.length - 1];
          const dt = (b[2] - a[2]) / 1000;
          if (dt <= 0 || dt > 0.3) return [0, 0];
          return [(b[0] - a[0]) / dt, (b[1] - a[1]) / dt];
        }

        private end(e: PointerEvent): void {
          const d = this._drag;
          if (!d || e.pointerId !== d.id) return;
          let [vx, vy] = this.velocity();
          const axis = this.axis();
          if (axis === 'y') vx = 0;
          if (axis === 'x') vy = 0;
          this._drag = null;
          this.removeAttribute('data-dragging');
          let tx = this._x;
          let ty = this._y;
          if (this.flag('spring-back')) {
            tx = 0;
            ty = 0;
          } else {
            if (this.flag('inertia') && !this.reduced) {
              tx = projectInertia(tx, vx);
              ty = projectInertia(ty, vy);
            }
            [tx, ty] = this.constrain(tx, ty);
          }
          this.emit('drag-end', { x: tx, y: ty, vx, vy });
          this.go(tx, ty, vx, vy);
        }

        private constrain(x: number, y: number): [number, number] {
          const snap = parseSnap(this.str('snap'));
          let tx = snapTo(x, snap);
          let ty = snapTo(y, snap);
          const b = this.limits();
          if (b) {
            tx = clamp(tx, b.minX, Math.max(b.minX, b.maxX));
            ty = clamp(ty, b.minY, Math.max(b.minY, b.maxY));
          }
          const axis = this.axis();
          return [axis === 'y' ? 0 : tx, axis === 'x' ? 0 : ty];
        }

        private go(x: number, y: number, vx = 0, vy = 0): void {
          this.setAttribute('data-moving', '');
          this._sx.set(x, vx);
          this._sy.set(y, vy);
        }

        private key(e: KeyboardEvent): void {
          if (this.flag('disabled')) return;
          const step = this.num('step', 16);
          const snap = parseSnap(this.str('snap'));
          const s = typeof snap === 'number' ? snap : step;
          const map: Record<string, [number, number]> = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] };
          if (e.key === 'Home' || e.key === 'Escape') {
            e.preventDefault();
            this.reset();
            return;
          }
          const m = map[e.key];
          if (!m) return;
          e.preventDefault();
          const [tx, ty] = this.flag('spring-back') ? [this._sx.target + m[0], this._sy.target + m[1]] : this.constrain(this._sx.target + m[0], this._sy.target + m[1]);
          this.go(tx, ty);
        }

        moveTo(x: number, y: number, animate = true): void {
          if (!animate) {
            this._sx.jump(x);
            this._sy.jump(y);
            return;
          }
          this.go(x, y);
        }

        reset(): void {
          this.go(0, 0);
        }
      },
    { id: 'draggable', text: css }
  );
}
