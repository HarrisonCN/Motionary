import { defineElement, type UsaElement } from '../base';
import { lottieToKeyframes, lottieToSvg, type LottieMotion } from '../fx2/lottie';
import css from './lottie.css?raw';

/**
 * `<usa-lottie src="anim.json">` (9.2) — plays a Lottie (bodymovin) file
 * without lottie-web: simple vector layers are rendered as SVG and their
 * transform / opacity keyframes run as WAAPI animations on Motionary's
 * clock. `autoplay` (on screen), `loop`, `speed`, `label`; `json`
 * property (set data directly), `play()`, `pause()`, `stop()`, `parsed`;
 * `usa:load` { duration, layers } / `usa:complete`. An `img` with `label`;
 * reduced motion: first frame, no autoplay.
 */
export interface UsaLottieElement extends UsaElement {
  json: unknown;
  readonly parsed: LottieMotion | null;
  play(): void;
  pause(): void;
  stop(): void;
}

export function defineLottie(tag = 'usa-lottie'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaLottie extends Base {
        static get observedAttributes(): string[] {
          return ['src', 'loop', 'speed', 'label'];
        }
        private _json: unknown = null;
        private _m: LottieMotion | null = null;
        private _anims: Animation[] = [];
        get json(): unknown {
          return this._json;
        }
        set json(v: unknown) {
          this._json = typeof v === 'string' ? JSON.parse(v) : v;
          if (this.isConnected) this.changed('json');
        }
        get parsed(): LottieMotion | null {
          return this._m;
        }
        mount(): void {
          this.setAttribute('role', 'img');
          this.setAttribute('aria-label', this.str('label', 'Animation'));
          const src = this.str('src');
          if (this._json) this.render(this._json);
          else if (src && typeof fetch !== 'undefined')
            fetch(src)
              .then((r) => r.json())
              .then((j) => this.isConnected && this.str('src') === src && ((this._json = j), this.render(j)))
              .catch(() => this.emit('error', { src }));
          this.onCleanup(() => this.stop());
        }
        protected render(j: unknown): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this._m = lottieToKeyframes(j);
          this.insertAdjacentHTML('beforeend', lottieToSvg(j).replace('<svg ', '<svg data-usa-part class="usa-lt-svg" '));
          this.emit('load', { duration: this._m.duration, layers: this._m.layers.length });
          this.frame(0);
          if (this.hasAttribute('autoplay') && !this.reduced)
            this.inView((v) => {
              if (v) this.play();
              else this.pause();
            });
        }
        private frame(i: number): void {
          this._m?.layers.forEach((l) => {
            const g = this.querySelector<SVGGElement>(`[data-layer="${l.index}"]`);
            const k = l.keyframes[i] || l.keyframes[0];
            if (g && k) {
              g.style.transform = String(k.transform || '');
              if (k.opacity != null) g.style.opacity = String(k.opacity);
            }
          });
        }
        play(): void {
          if (!this._m || this.reduced) return;
          if (this._anims.length) {
            this._anims.forEach((a) => a.play());
            return;
          }
          const iterations = this.hasAttribute('loop') ? Infinity : 1;
          const rate = Math.max(0.1, this.num('speed', 1));
          this._anims = this._m.layers
            .map((l) => {
              const g = this.querySelector(`[data-layer="${l.index}"]`);
              const a = g ? this.motion(g, l.keyframes, { duration: this._m!.duration / rate, iterations, fill: 'both' }) : null;
              return a;
            })
            .filter(Boolean) as Animation[];
          const first = this._anims[0];
          if (first && iterations === 1) first.finished.then(() => this.emit('complete'), () => undefined);
        }
        pause(): void {
          this._anims.forEach((a) => a.pause());
        }
        stop(): void {
          this._anims.splice(0).forEach((a) => a.cancel());
          this.frame(0);
        }
      }
      return UsaLottie as unknown as CustomElementConstructor;
    },
    { id: 'lottie', text: css }
  );
}
