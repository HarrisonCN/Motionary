import { defineElement, type UsaElement } from '../base';
import { runtimeModule } from './runtime-link';
import type { SmoothApi, SmoothScroll } from '../../runtime/smooth';
import css from './smooth-scroll.css?raw';

/**
 * `<usa-smooth-scroll lerp="0.1"></usa-smooth-scroll>` (10.4) — smooth,
 * inertial wheel scrolling with **`motionary/runtime/smooth`** (requires
 * `use(smooth)` first). Without `wrapper` it smooths the whole page while it
 * is in the document; with `wrapper` the element itself becomes the smooth
 * scroll container (give it a height). `lerp` (0–1), `duration` + `ease`
 * (fixed glide instead of lerp), `wheel-multiplier`, `horizontal`, `touch`,
 * `anchors` (default on; `anchors="false"` to keep native jumps), `offset`
 * (px, for sticky headers), `preview` (demo: glides through a wrapper while
 * visible). Off under reduced motion (native scrolling). `glideTo(target)`,
 * `stop()`, `resume()`, `instance`; `usa:ready`, `usa:scroll` (progress).
 */
export interface UsaSmoothScrollElement extends UsaElement {
  glideTo(target: number | string | Element, opts?: { offset?: number; immediate?: boolean }): void;
  stop(): void;
  resume(): void;
  readonly instance: SmoothScroll | null;
}

export function defineSmoothScroll(tag = 'usa-smooth-scroll'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaSmoothScroll extends Base {
        static get observedAttributes(): string[] {
          return ['lerp', 'duration', 'ease', 'wheel-multiplier', 'horizontal', 'touch', 'anchors', 'offset', 'wrapper', 'preview'];
        }
        private s: SmoothScroll | null = null;
        get instance(): SmoothScroll | null {
          return this.s;
        }
        mount(): void {
          const api = runtimeModule<SmoothApi>(this, 'smooth');
          if (!api) return;
          const wrapper = this.flag('wrapper');
          this.toggleAttribute('data-wrapper', wrapper);
          const anchors = this.getAttribute('anchors') === 'false' ? false : { offset: -this.num('offset', 0) }; // offset="64" stops 64 px above the target (sticky headers)
          const s = api.smoothScroll({
            wrapper: wrapper ? this : undefined,
            lerp: this.num('lerp', 0.1),
            duration: this.num('duration', 0) || undefined,
            ease: this.str('ease') || undefined,
            wheelMultiplier: this.num('wheel-multiplier', 1),
            orientation: this.flag('horizontal') ? 'horizontal' : 'vertical',
            touch: this.flag('touch'),
            anchors,
            onScroll: (x) => {
              this.style.setProperty('--usa-smooth-progress', x.progress.toFixed(4));
              this.emit('scroll', { progress: x.progress, velocity: x.velocity });
            },
          });
          this.s = s;
          this.dataset.active = String(s.active);
          this.onCleanup(() => {
            s.destroy();
            this.s = null;
          });
          this.emit('ready', { active: s.active });
          if (wrapper && this.flag('preview') && s.active) {
            let dir = 1, user = false, timer: ReturnType<typeof setTimeout> | null = null;
            const glide = () => {
              if (user) return;
              s.scrollTo(dir > 0 ? s.limit : 0, { duration: 1600 });
              dir = -dir;
              timer = setTimeout(glide, 2400);
            };
            this.inView((v) => {
              if (timer) clearTimeout(timer);
              timer = v ? setTimeout(glide, 300) : null;
            });
            this.listen(this, 'wheel', () => (user = true), { passive: true });
            this.listen(this, 'pointerdown', () => (user = true), { passive: true });
            this.onCleanup(() => timer && clearTimeout(timer));
          }
        }
        glideTo(target: number | string | Element, opts: { offset?: number; immediate?: boolean } = {}): void {
          this.s?.scrollTo(target, opts);
        }
        stop(): void {
          this.s?.stop();
        }
        resume(): void {
          this.s?.resume();
        }
      }
      return UsaSmoothScroll as unknown as CustomElementConstructor;
    },
    { id: 'smooth-scroll', text: css }
  );
}
