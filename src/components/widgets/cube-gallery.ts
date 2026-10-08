import { defineElement, type UsaElement } from '../base';
import { ownChildren, part } from './shared';
import css from './cube-gallery.css?raw';

/**
 * `<usa-cube-gallery>` (6.5) — a gallery on a turning 3D cube: the current
 * slide and the next one sit on adjacent faces and the cube rotates between
 * them. Swipe / drag, arrow keys, prev / next buttons, `autoplay` (ms;
 * pauses on hover, focus and off screen), `axis="y | x"`. API `next()`,
 * `prev()`, `goTo(i)`, `index`; event `usa:change`. Reduced motion: slides
 * switch with a fade.
 */
export interface UsaCubeGalleryElement extends UsaElement {
  readonly index: number;
  next(): void;
  prev(): void;
  goTo(i: number): void;
}

export function defineCubeGallery(tag = 'usa-cube-gallery'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaCubeGallery extends Base {
        static get observedAttributes(): string[] {
          return ['axis', 'autoplay'];
        }
        private _slides: HTMLElement[] = [];
        private _i = 0;
        private _stage: HTMLElement | null = null;
        private _busy = false;
        private _timer: ReturnType<typeof setInterval> | 0 = 0;

        get index(): number {
          return this._i;
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this._slides = ownChildren(this);
          this.dataset.axis = this.str('axis', 'y') === 'x' ? 'x' : 'y';
          this.setAttribute('role', 'region');
          this.setAttribute('aria-roledescription', 'carousel');
          if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', this.str('label', 'Gallery'));
          this.tabIndex = 0;
          const stage = part('div', 'usa-cube-stage');
          this._slides.forEach((s, i) => {
            s.classList.add('usa-cube-face');
            s.setAttribute('role', 'group');
            s.setAttribute('aria-roledescription', 'slide');
            s.setAttribute('aria-label', `${i + 1} of ${this._slides.length}`);
            stage.append(s);
          });
          this.append(stage);
          this._stage = stage;
          const prev = part('button', 'usa-cube-btn usa-cube-prev', { type: 'button', 'aria-label': 'Previous slide' }, '‹');
          const next = part('button', 'usa-cube-btn usa-cube-next', { type: 'button', 'aria-label': 'Next slide' }, '›');
          this.append(prev, next);
          this.listen(prev, 'click', () => this.prev());
          this.listen(next, 'click', () => this.next());
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.target !== this) return;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') this.next();
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') this.prev();
            else return;
            e.preventDefault();
          });
          let x0 = NaN;
          this.listen(stage, 'pointerdown', (e: PointerEvent) => (x0 = this.dataset.axis === 'x' ? e.clientY : e.clientX));
          this.listen(stage, 'pointerup', (e: PointerEvent) => {
            if (Number.isNaN(x0)) return;
            const d = (this.dataset.axis === 'x' ? e.clientY : e.clientX) - x0;
            x0 = NaN;
            if (Math.abs(d) > 40) (d < 0 ? this.next() : this.prev());
          });
          this._i = Math.min(this._i, Math.max(0, this._slides.length - 1));
          this.show();
          const ms = this.num('autoplay', 0);
          if (ms > 0 && !this.reduced) {
            let hold = false;
            let vis = true;
            const pause = (v: boolean) => (hold = v);
            this.listen(this, 'pointerenter', () => pause(true));
            this.listen(this, 'pointerleave', () => pause(false));
            this.listen(this, 'focusin', () => pause(true));
            this.listen(this, 'focusout', () => pause(false));
            this.inView((v) => (vis = v));
            this._timer = setInterval(() => !hold && vis && this.next(), Math.max(1200, ms));
            this.onCleanup(() => this._timer && clearInterval(this._timer));
          }
        }

        private show(): void {
          this._slides.forEach((s, k) => {
            const on = k === this._i;
            s.toggleAttribute('data-active', on);
            s.inert = !on;
            s.style.transform = '';
          });
        }

        goTo(i: number): void {
          const n = this._slides.length;
          if (!n || this._busy) return;
          const to = ((i % n) + n) % n;
          if (to === this._i) return;
          const from = this._i;
          const dir = (to > from && !(from === 0 && to === n - 1)) || (from === n - 1 && to === 0) ? 1 : -1;
          const a = this._slides[from];
          const b = this._slides[to];
          this._i = to;
          this.emit('change', { index: to, from });
          if (this.reduced || !this._stage) {
            this.show();
            this.motion(b, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
            return;
          }
          // b waits on the adjacent face; the stage turns by 90°
          const ax = this.dataset.axis === 'x' ? 'X' : 'Y';
          const half = `${(((ax === 'Y' ? this.offsetWidth : this.offsetHeight) || 280) / 2).toFixed(1)}px`;
          const faceB = ax === 'Y' ? `rotateY(${dir * 90}deg) translateZ(${half})` : `rotateX(${-dir * 90}deg) translateZ(${half})`;
          b.setAttribute('data-active', '');
          b.style.transform = faceB;
          a.style.transform = `translateZ(${half})`;
          this._busy = true;
          const turn = ax === 'Y' ? `rotateY(${-dir * 90}deg)` : `rotateX(${dir * 90}deg)`;
          const anim = this.motion(this._stage, [{ transform: `translateZ(-${half}) rotate${ax}(0deg)` }, { transform: `translateZ(-${half}) ${turn}` }], { duration: 780, easing: 'cubic-bezier(.65,.05,.3,1)' });
          const end = () => {
            this._busy = false;
            this.show();
          };
          if (anim) anim.finished.then(end, end);
          else end();
        }

        next(): void {
          this.goTo(this._i + 1);
        }
        prev(): void {
          this.goTo(this._i - 1);
        }
      }
      return UsaCubeGallery as unknown as CustomElementConstructor;
    },
    { id: 'cube-gallery', text: css }
  );
}
