import { defineElement, type UsaElement } from '../base';
import { createSpring, rubberBand, type SpringValue } from './spring';
import css from './overscroll.css?raw';

/**
 * `<usa-overscroll>` — an elastic scroll container: pulling past the top or
 * bottom (touch, trackpad or wheel) stretches the content with iOS-style
 * rubber-band resistance and it springs back on release.
 *
 * Attributes: `axis` (`y` default, `x`), `max` (largest stretch in px, 120),
 * `preset` (spring, default `default`), `disabled`. CSS variable
 * `--usa-overscroll` holds the current offset. Reduced motion: no stretch
 * (a plain scroll container with `overscroll-behavior: contain`).
 */
export interface UsaOverscrollElement extends UsaElement {
  /** Current stretch in px (negative = pulled past the end). */
  readonly offset: number;
}

export function defineOverscroll(tag = 'usa-overscroll'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaOverscroll extends Base {
        static get observedAttributes(): string[] {
          return ['axis', 'disabled', 'max', 'preset'];
        }

        private _off = 0;
        private _spring!: SpringValue;

        get offset(): number {
          return this._off;
        }

        private set(v: number): void {
          this._off = v;
          this.style.setProperty('--usa-overscroll', `${v}px`);
          this.toggleAttribute('data-stretched', Math.abs(v) > 0.5);
        }

        private edge(delta: number): boolean {
          const x = this.str('axis', 'y') === 'x';
          const pos = x ? this.scrollLeft : this.scrollTop;
          const max = (x ? this.scrollWidth - this.clientWidth : this.scrollHeight - this.clientHeight) - 1;
          return (delta < 0 && pos <= 0) || (delta > 0 && pos >= max);
        }

        private stretch(raw: number): void {
          const max = this.num('max', 120);
          this.set(Math.max(-max, Math.min(max, rubberBand(raw, max * 2.5))));
        }

        mount(): void {
          this._spring = createSpring({ spring: this.str('preset', 'default'), onUpdate: (v) => this.set(v) });
          const x = this.str('axis', 'y') === 'x';
          const off = () => this.flag('disabled') || this.reduced;
          // Wheel / trackpad: accumulate past the edge, spring back when it stops.
          let pull = 0;
          let timer: ReturnType<typeof setTimeout> | undefined;
          this.listen(this, 'wheel', (e: WheelEvent) => {
            const d = x ? e.deltaX || e.deltaY : e.deltaY;
            if (off() || !d || !this.edge(d)) return;
            this._spring.stop();
            pull -= d;
            this.stretch(pull);
            clearTimeout(timer);
            timer = setTimeout(() => {
              pull = 0;
              this._spring.jump(this._off);
              this._spring.set(0);
            }, 140);
          }, { passive: true });
          this.onCleanup(() => clearTimeout(timer));
          // Touch: rubber-band while the finger pulls past the edge.
          let start = 0;
          let active = false;
          this.listen(this, 'touchstart', (e: TouchEvent) => {
            if (off()) return;
            const t = e.touches[0];
            start = x ? t.clientX : t.clientY;
            active = false;
            this._spring.stop();
          }, { passive: true });
          this.listen(this, 'touchmove', (e: TouchEvent) => {
            if (off()) return;
            const t = e.touches[0];
            const dist = (x ? t.clientX : t.clientY) - start;
            if (!active && dist !== 0 && this.edge(-dist)) active = true;
            if (!active) return;
            if (e.cancelable) e.preventDefault();
            this.stretch(dist);
          }, { passive: false });
          const release = () => {
            if (!active) return;
            active = false;
            this._spring.jump(this._off);
            this._spring.set(0);
          };
          this.listen(this, 'touchend', release);
          this.listen(this, 'touchcancel', release);
        }

        unmount(): void {
          this._spring?.stop();
          this.set(0);
        }
      },
    { id: 'overscroll', text: css }
  );
}
