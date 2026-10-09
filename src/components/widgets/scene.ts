import { defineElement, onFrame, type UsaElement } from '../base';
import { cameraFrame, CAMERA_MOVES } from '../fx2/cinema';
import css from './scene.css?raw';

/**
 * `<usa-scene camera="dolly-in" strength="1">` (9.1) — a scroll-scrubbed
 * cinematic shot: while the scene crosses the viewport its media (first
 * `img` / `video` / `[data-shot]` child) follows a camera move —
 * `dolly-in` · `dolly-out` · `pan-left` · `pan-right` · `tilt-up` ·
 * `tilt-down` · `zoom-in` · `zoom-out` · `orbit` — and `[data-caption]`
 * children fade in at their `data-at` progress (0–1). `autoplay` plays the
 * move on its own (looping back and forth) instead of following the scroll.
 * `progress` (0–1);
 * `usa:shot` { progress } while it moves. Reduced motion: a still frame,
 * captions shown.
 */
export interface UsaSceneElement extends UsaElement {
  readonly progress: number;
  setProgress(p: number): void;
}

export function defineScene(tag = 'usa-scene'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaScene extends Base {
        static get observedAttributes(): string[] {
          return ['camera', 'strength', 'autoplay'];
        }
        private _p = 0;
        get progress(): number {
          return this._p;
        }
        private media(): HTMLElement | null {
          return this.querySelector(':scope > [data-shot], :scope > img, :scope > video, :scope > picture');
        }
        mount(): void {
          const move = (CAMERA_MOVES as readonly string[]).includes(this.str('camera')) ? this.str('camera') : 'dolly-in';
          this.setAttribute('data-camera', move);
          const m = this.media();
          m?.classList.add('usa-scene-media');
          const caps = Array.from(this.querySelectorAll<HTMLElement>(':scope > [data-caption]'));
          if (this.reduced) {
            caps.forEach((c) => c.setAttribute('data-shown', ''));
            return;
          }
          if (this.hasAttribute('autoplay')) {
            caps.forEach((c) => c.setAttribute('data-shown', ''));
            const st = this.num('strength', 1);
            this.inView((v) => {
              m?.getAnimations?.().forEach((a) => a.cancel());
              if (v && m) this.motion(m, [0, 0.25, 0.5, 0.75, 1].map((p) => ({ transform: cameraFrame(move, p, st) })), { duration: 7000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
            });
            return;
          }
          let stop: (() => void) | null = null;
          this.inView((v) => {
            stop?.();
            stop = null;
            if (!v) return;
            let last = -1;
            stop = onFrame(() => {
              const r = this.getBoundingClientRect();
              const vh = innerHeight || 1;
              const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
              if (Math.abs(p - last) < 0.001) return;
              last = p;
              this.setProgress(p, move);
            });
          });
          this.onCleanup(() => stop?.());
        }
        /** Render the shot at progress `p` (0–1) — also used by tests / scroll timelines. */
        setProgress(p: number, move = this.getAttribute('data-camera') || 'dolly-in'): void {
          this._p = Math.min(1, Math.max(0, p));
          const m = this.media();
          if (m) m.style.transform = cameraFrame(move, this._p, this.num('strength', 1));
          this.querySelectorAll<HTMLElement>(':scope > [data-caption]').forEach((c) => this.setFlagOn(c, this._p >= Number(c.dataset.at ?? 0.3)));
          this.emit('shot', { progress: this._p });
        }
        private setFlagOn(el: Element, on: boolean): void {
          if (on) el.setAttribute('data-shown', '');
          else el.removeAttribute('data-shown');
        }
      }
      return UsaScene as unknown as CustomElementConstructor;
    },
    { id: 'scene', text: css }
  );
}
