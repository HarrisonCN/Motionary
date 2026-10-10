import { defineElement, type UsaElement } from '../base';
import { createSpring, type SpringValue } from '../physics/spring';
import css from './carousel-3d.css?raw';

/**
 * `<usa-carousel-3d>` — its element children on a 3D ring. Rotate with the
 * arrow keys, a drag/swipe, the wheel (shift) or `next()` / `prev()`; the
 * front item is `aria-current`. Spring-driven rotation.
 *
 * Attributes: `radius` (px, auto from item width), `autoplay` (ms between
 * steps, pauses on hover/focus), `perspective` (px, 1200), `index`.
 * Events: `usa:change` (`{ index }`). Reduced motion: a flat, instant
 * switch (only the current item is shown, others dimmed).
 */
export interface UsaCarousel3dElement extends UsaElement {
  index: number;
  next(): void;
  prev(): void;
  goTo(i: number): void;
}

export function defineCarousel3d(tag = 'usa-carousel-3d'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaCarousel3d extends Base {
        static get observedAttributes(): string[] {
          return ['radius', 'perspective', 'autoplay', 'index'];
        }

        private _angle!: SpringValue;
        private _i = 0;

        get index(): number {
          return this._i;
        }
        set index(v: number) {
          this.goTo(v);
        }

        private items(): HTMLElement[] {
          return Array.from(this.children) as HTMLElement[];
        }

        private render(angle: number): void {
          const items = this.items();
          const n = items.length || 1;
          const step = 360 / n;
          const w = items[0]?.offsetWidth || 200;
          const r = this.num('radius', Math.round(w / 2 / Math.tan(Math.PI / n)) + 24);
          const reduced = this.reduced;
          items.forEach((it, i) => {
            const norm = ((((i * step - angle) % 360) + 540) % 360) - 180;
            it.style.transform = reduced ? '' : `rotateY(${norm.toFixed(2)}deg) translateZ(${r}px)`;
            it.style.opacity = reduced ? (i === this._i ? '1' : '0') : String(Math.max(0.25, 1 - Math.abs(norm) / 200));
          });
        }

        mount(): void {
          this.style.setProperty('--usa-c3d-perspective', `${this.num('perspective', 1200)}px`);
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          this.setAttribute('role', 'region');
          this.setAttribute('aria-roledescription', 'carousel');
          this._i = Math.max(0, Math.min(this.items().length - 1, this.num('index', 0)));
          const step = () => 360 / (this.items().length || 1);
          this._angle = createSpring({ value: this._i * step(), spring: 'gentle', onUpdate: (v) => this.render(v) });
          this.render(this._angle.value);
          this.mark();
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') this.next();
            else if (e.key === 'ArrowLeft') this.prev();
            else return;
            e.preventDefault();
          });
          let x0: number | null = null;
          this.listen(this, 'pointerdown', (e: PointerEvent) => (x0 = e.clientX));
          this.listen(this, 'pointerup', (e: PointerEvent) => {
            if (x0 === null) return;
            const dx = e.clientX - x0;
            x0 = null;
            if (Math.abs(dx) > 40) dx < 0 ? this.next() : this.prev();
          });
          this.listen(this, 'click', (e: MouseEvent) => {
            const it = this.items().find((c) => c.contains(e.target as Node));
            if (it) {
              const i = this.items().indexOf(it);
              if (i !== this._i) this.goTo(i);
            }
          });
          const every = this.num('autoplay', 0);
          if (every > 0 && !this.reduced) {
            let paused = false;
            const pause = () => (paused = true);
            const resume = () => (paused = false);
            this.listen(this, 'pointerenter', pause);
            this.listen(this, 'pointerleave', resume);
            this.listen(this, 'focusin', pause);
            this.listen(this, 'focusout', resume);
            const t = setInterval(() => !paused && !document.hidden && this.next(), every);
            this.onCleanup(() => clearInterval(t));
          }
        }

        unmount(): void {
          this._angle?.stop();
        }

        private mark(): void {
          this.items().forEach((it, i) => {
            if (i === this._i) it.setAttribute('aria-current', 'true');
            else it.removeAttribute('aria-current');
          });
        }

        goTo(i: number): void {
          const n = this.items().length;
          if (!n || !this._angle) return;
          const step = 360 / n;
          // shortest rotation from the current target
          const cur = this._angle.target;
          const curIdx = Math.round(cur / step);
          let delta = (((i - curIdx) % n) + n) % n;
          if (delta > n / 2) delta -= n;
          this._i = ((i % n) + n) % n;
          this._angle.set((curIdx + delta) * step);
          if (this.reduced) this.render(this._angle.value);
          this.mark();
          this.emit('change', { index: this._i });
        }

        next(): void {
          this.goTo(this._i + 1);
        }

        prev(): void {
          this.goTo(this._i - 1);
        }
      },
    { id: 'carousel-3d', text: css }
  );
}
