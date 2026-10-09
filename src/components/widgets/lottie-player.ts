import { defineElement, type UsaElement } from '../base';
import { runtimeModule } from './runtime-link';
import type { VectorApi, LottiePlayer, LottieAnimation } from '../../runtime/vector';
import css from './lottie-player.css?raw';

/**
 * `<usa-lottie-player src="hero.lottie" autoplay loop></usa-lottie-player>`
 * (10.6) — plays Lottie JSON and dotLottie (`.lottie`) files with
 * **`motionary/runtime/vector`** (requires `use(vector)`): Motionary's own
 * Canvas 2D renderer for the documented subset (shapes, gradients, trim
 * paths, masks, track mattes, precomps, images). `animation` (id inside a
 * dotLottie), `autoplay`, `loop` (or a count), `speed`, `mode` (normal ·
 * bounce), `segment` ("0,30" or a marker name), `hover` (play on hover),
 * `scrub` (progress follows the element's scroll position), `fit` (contain ·
 * cover · fill), `background`, `label`. Methods `play()`, `pause()`,
 * `stop()`, `seek(frame)`, `player`, `animationData`, `unsupported`
 * (features in the file this renderer skips); `usa:load`, `usa:complete`,
 * `usa:error`. Reduced motion: first frame, no autoplay. Renders only while
 * visible.
 */
export interface UsaLottiePlayerElement extends UsaElement {
  play(): void;
  pause(): void;
  stop(): void;
  seek(frame: number): void;
  readonly player: LottiePlayer | null;
  readonly animationData: LottieAnimation | null;
  readonly unsupported: string[];
}

export function defineLottiePlayer(tag = 'usa-lottie-player'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaLottiePlayer extends Base {
        static get observedAttributes(): string[] {
          return ['src', 'animation', 'autoplay', 'loop', 'speed', 'mode', 'segment', 'hover', 'scrub', 'fit', 'background', 'label'];
        }
        private p: LottiePlayer | null = null;
        private data: LottieAnimation | null = null;
        private skipped: string[] = [];
        get player(): LottiePlayer | null {
          return this.p;
        }
        get animationData(): LottieAnimation | null {
          return this.data;
        }
        get unsupported(): string[] {
          return this.skipped.slice();
        }
        play(): void {
          this.p?.play();
        }
        pause(): void {
          this.p?.pause();
        }
        stop(): void {
          this.p?.pause();
          this.p?.seek(0);
        }
        seek(frame: number): void {
          if (!this.p || !this.data) return;
          this.p.pause();
          this.p.seek((frame / this.data.fr) * 1000);
        }
        mount(): void {
          const V = runtimeModule<VectorApi>(this, 'vector');
          if (!V) return;
          const canvas = document.createElement('canvas');
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', this.str('label', 'Animation'));
          this.querySelector(':scope > canvas')?.remove();
          this.prepend(canvas);
          this.onCleanup(() => canvas.remove());
          const src = this.str('src');
          if (!src) return;
          let alive = true;
          this.onCleanup(() => {
            alive = false;
            this.p?.kill();
            this.p = null;
          });
          V.loadLottie(new URL(src, location.href).href, { animation: this.str('animation') || undefined })
            .then(({ animation: source, images, dotLottie }) => {
              if (!alive) return;
              const animationId = this.str('animation') || dotLottie?.manifest?.activeAnimationId || dotLottie?.manifest?.animations?.[0]?.id;
              // 10.9: subclasses (<usa-dotlottie>) may theme the animation before it plays
              const animation = (this as any).prepareAnimation ? (this as any).prepareAnimation(source, dotLottie, animationId) : source;
              this.data = animation;
              this.skipped = V.inspectLottie(animation).unsupported;
              const dpr = Math.min(2, devicePixelRatio || 1);
              const w = Math.max(1, Math.round((canvas.clientWidth || animation.w) * dpr));
              canvas.width = w;
              canvas.height = Math.round((w * animation.h) / animation.w);
              const seg = this.str('segment');
              const loopAttr = this.getAttribute('loop');
              const opts = {
                images,
                autoplay: false,
                loop: loopAttr === null ? false : loopAttr === '' || loopAttr === 'true' ? true : Math.max(0, Number(loopAttr) - 1) || true,
                bounce: this.str('mode') === 'bounce',
                speed: this.num('speed', 1),
                fit: (this.str('fit', 'contain') as any) || 'contain',
                background: this.str('background') || undefined,
                segment: seg ? (/^\d/.test(seg) ? (seg.split(/[\s,]+/).map(Number) as [number, number]) : seg) : undefined,
              };
              const build = (a: LottieAnimation): LottiePlayer => {
                this.p?.kill();
                const np = V.lottiePlayer(canvas, a, opts);
                np.onComplete = () => {
                  this.emit('complete');
                  (this as any).completed?.();
                };
                this.p = np;
                this.data = a;
                return np;
              };
              const p = build(animation);
              this.emit('load', { frames: animation.op - animation.ip, fr: animation.fr, w: animation.w, h: animation.h, unsupported: this.skipped });
              if ((this as any).playerReady?.({ player: p, animation, dotLottie, canvas, rebuild: build, source, animationId })) return;
              if (this.reduced) return;
              if (this.flag('scrub')) {
                const upd = () => {
                  const r = this.getBoundingClientRect();
                  p.progress = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height)));
                };
                this.listen(window, 'scroll', upd, { passive: true });
                upd();
              } else if (this.flag('hover')) {
                this.listen(this, 'pointerenter', () => p.play());
                this.listen(this, 'pointerleave', () => p.pause());
              } else if (this.flag('autoplay')) this.inView((v) => (v ? p.play() : p.pause()));
            })
            .catch((e) => alive && this.emit('error', { error: String(e?.message || e) }));
        }
      }
      return UsaLottiePlayer as unknown as CustomElementConstructor;
    },
    { id: 'lottie-player', text: css }
  );
}
