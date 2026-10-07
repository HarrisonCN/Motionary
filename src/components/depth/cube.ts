import { defineElement, type UsaElement } from '../base';
import { createSpring, type SpringValue } from '../physics/spring';
import { gesture } from '../gesture/core';
import css from './depth.css?raw';

const FACES = ['front', 'right', 'back', 'left', 'top', 'bottom'] as const;
/** Rotation (deg) that brings each face to the front. */
const ROT: Record<string, [number, number]> = { front: [0, 0], right: [0, -90], back: [0, -180], left: [0, 90], top: [-90, 0], bottom: [90, 0] };

/**
 * `<usa-cube>` — a CSS 3D cube whose up-to-six element children are its faces
 * (front, right, back, left, top, bottom). Rotate with drag / swipe, arrow
 * keys, `autoplay` (ms) or `show(face | index)`; spring-driven.
 * Attributes: `size` (px, 200), `autoplay`, `perspective` (900).
 * `usa:change` (`{ index, face }`). Reduced motion: instant face switch.
 */
export interface UsaCubeElement extends UsaElement {
  readonly index: number;
  show(face: number | string): void;
  next(): void;
  prev(): void;
}

export function defineCube(tag = 'usa-cube'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaCube extends Base {
        static get observedAttributes(): string[] {
          return ['size', 'autoplay'];
        }
        private _i = 0;
        private _rx!: SpringValue;
        private _ry!: SpringValue;
        private _base: [number, number] = [0, 0];

        get index(): number {
          return this._i;
        }

        private faces(): HTMLElement[] {
          return Array.from(this.children).filter((c) => c instanceof HTMLElement && !c.hasAttribute('slot')).slice(0, 6) as HTMLElement[];
        }

        private paint(): void {
          this.style.setProperty('--usa-cube-rx', `${this._rx.value}deg`);
          this.style.setProperty('--usa-cube-ry', `${this._ry.value}deg`);
        }

        show(face: number | string): void {
          const n = this.faces().length || 1;
          const i = typeof face === 'number' ? ((face % n) + n) % n : Math.max(0, FACES.indexOf(face as any));
          this._i = i;
          const [rx, ry] = ROT[FACES[i]];
          // take the shortest way round on Y
          const cur = this._ry.target;
          const ty = ry + Math.round((cur - ry) / 360) * 360;
          this._base = [rx, ty];
          if (this.reduced) {
            this._rx.jump(rx);
            this._ry.jump(ty);
          } else {
            this._rx.set(rx);
            this._ry.set(ty);
          }
          this.faces().forEach((f, j) => f.setAttribute('aria-hidden', String(j !== i)));
          this.emit('change', { index: i, face: FACES[i] });
        }

        next(): void {
          this.show(this._i + 1);
        }

        prev(): void {
          this.show(this._i - 1);
        }

        mount(): void {
          this.style.setProperty('--usa-cube-size', `${this.num('size', 200)}px`);
          this.style.setProperty('--usa-cube-perspective', `${this.num('perspective', 900)}px`);
          this.faces().forEach((f, j) => f.setAttribute('data-face', FACES[j]));
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          if (!this.hasAttribute('role')) this.setAttribute('role', 'region');
          if (!this.hasAttribute('aria-roledescription')) this.setAttribute('aria-roledescription', 'cube');
          this._rx = createSpring({ spring: 'gentle', onUpdate: () => this.paint() });
          this._ry = createSpring({ spring: 'gentle', onUpdate: () => this.paint() });
          this.show(this._i);
          this.paint();
          this.onCleanup(
            gesture(this, {
              onPan: ({ dx, dy, last }) => {
                if (this.reduced) return;
                if (!last) {
                  this._ry.jump(this._base[1] + dx * 0.5);
                  this._rx.jump(this._base[0] - dy * 0.5);
                  return;
                }
                if (Math.abs(dx) > 40 && Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? this.next() : this.prev();
                if (Math.abs(dy) > 40 && this.faces().length > 4) return this.show(dy < 0 ? 'bottom' : 'top');
                this.show(this._i);
              },
            })
          );
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            const k: Record<string, () => void> = { ArrowRight: () => this.next(), ArrowLeft: () => this.prev(), ArrowUp: () => this.show('bottom'), ArrowDown: () => this.show('top'), Home: () => this.show(0) };
            if (!k[e.key] || ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && this.faces().length < 6)) return;
            e.preventDefault();
            k[e.key]();
          });
          const ms = this.num('autoplay', 0);
          if (ms > 0 && !this.reduced) {
            let paused = false;
            const id = setInterval(() => !paused && this.show((this._i + 1) % Math.min(4, this.faces().length || 1)), ms);
            this.listen(this, 'pointerenter', () => (paused = true));
            this.listen(this, 'pointerleave', () => (paused = false));
            this.listen(this, 'focusin', () => (paused = true));
            this.listen(this, 'focusout', () => (paused = false));
            this.onCleanup(() => clearInterval(id));
          }
        }

        unmount(): void {
          this._rx?.stop();
          this._ry?.stop();
        }
      },
    { id: 'depth', text: css }
  );
}
