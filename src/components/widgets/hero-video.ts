import { defineElement, type UsaElement } from '../base';
import { scrubVideo } from '../fx2/video';
import css from './hero-video.css?raw';

/**
 * `<usa-hero-video>` (9.4) — a full-bleed hero with a background video:
 * the poster (`poster` image URL, an `<img>` child, or a gradient) shows
 * first and cross-fades to the video once it can play; a scrim keeps your
 * content readable and a pause / play button is always there (WCAG 2.2.2).
 * `scrub` makes it scroll-driven (the video follows the scroll instead of
 * playing). Without a playable video the poster drifts slowly (Ken Burns).
 * `paused`, `toggle()`; `usa:play` / `usa:pause`. A `region` with `label`;
 * reduced motion: poster only, no autoplay.
 */
export interface UsaHeroVideoElement extends UsaElement {
  readonly paused: boolean;
  toggle(): void;
}

export function defineHeroVideo(tag = 'usa-hero-video'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaHeroVideo extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'scrub', 'poster'];
        }
        private _paused = false;
        get paused(): boolean {
          return this._paused;
        }
        private video(): HTMLVideoElement | null {
          return this.querySelector(':scope > video');
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.setAttribute('role', 'region');
          this.setAttribute('aria-label', this.str('label', 'Hero'));
          const v = this.video();
          const poster = this.str('poster');
          this.insertAdjacentHTML('afterbegin', `<div class="usa-hv-poster" aria-hidden="true" data-usa-part${poster ? ` style="background-image:url('${poster.replace(/['")\\]/g, '')}')"` : ''}></div><div class="usa-hv-scrim" aria-hidden="true" data-usa-part></div>`);
          const scrub = this.hasAttribute('scrub');
          if (!scrub) this.insertAdjacentHTML('beforeend', '<button type="button" class="usa-hv-toggle" aria-label="Pause background video" data-usa-part></button>');
          if (!v || this.reduced) {
            this.setAttribute('data-poster-only', '');
            this._paused = true;
            v?.removeAttribute('autoplay');
            v?.pause?.();
            this.querySelector('.usa-hv-toggle')?.setAttribute('hidden', '');
            return;
          }
          v.muted = true;
          v.playsInline = true;
          v.setAttribute('aria-hidden', 'true');
          this.listen(v, 'canplay', () => this.setAttribute('data-ready', ''));
          this.listen(v, 'error', () => this.setAttribute('data-poster-only', ''));
          if (scrub) {
            v.loop = false;
            this.onCleanup(scrubVideo(v, this));
          } else {
            v.loop = true;
            this.listen(this.querySelector('.usa-hv-toggle') as Element, 'click', () => this.toggle());
            this.inView((vis) => {
              if (this._paused) return;
              if (vis) v.play?.()?.catch?.(() => this.setAttribute('data-poster-only', ''));
              else v.pause?.();
            });
          }
        }
        toggle(): void {
          const v = this.video();
          const b = this.querySelector('.usa-hv-toggle');
          this._paused = !this._paused;
          if (this._paused) v?.pause?.();
          else v?.play?.()?.catch?.(() => undefined);
          b?.setAttribute('aria-label', this._paused ? 'Play background video' : 'Pause background video');
          this.setFlag('data-paused', this._paused);
          this.emit(this._paused ? 'pause' : 'play');
        }
      }
      return UsaHeroVideo as unknown as CustomElementConstructor;
    },
    { id: 'hero-video', text: css }
  );
}
