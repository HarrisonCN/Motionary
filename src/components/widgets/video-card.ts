import { defineElement, type UsaElement } from '../base';
import css from './video-card.css?raw';

/**
 * `<usa-video-card>` (9.4) — a video thumbnail card: hover / focus plays a
 * muted preview of its `<video>` (paused and rewound on leave) with a
 * progress line, a play badge and a duration chip (`duration` attribute or
 * read from the video). Without a playable video the poster (`<img>` child
 * or `poster` gradient) gets a slow Ken Burns drift instead. Click / Enter →
 * `usa:open`. `previewing`; a focusable `link`-like button with your
 * `label`; reduced motion: no preview, no drift.
 */
export interface UsaVideoCardElement extends UsaElement {
  readonly previewing: boolean;
}
const fmt = (s: number) => (Number.isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '');

export function defineVideoCard(tag = 'usa-video-card'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaVideoCard extends Base {
        static get observedAttributes(): string[] {
          return ['label', 'duration'];
        }
        private _on = false;
        get previewing(): boolean {
          return this._on;
        }
        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.setAttribute('role', 'button');
          if (!this.hasAttribute('tabindex')) this.tabIndex = 0;
          const title = this.querySelector('[data-title], h3, h4, figcaption')?.textContent?.trim();
          this.setAttribute('aria-label', this.str('label', title ? `Play ${title}` : 'Play video'));
          const v = this.querySelector<HTMLVideoElement>(':scope video, :scope > .usa-vc-media video');
          if (v) {
            v.muted = true;
            v.playsInline = true;
            v.loop = true;
            v.preload = v.preload || 'metadata';
            v.setAttribute('aria-hidden', 'true');
            v.tabIndex = -1;
          }
          const dur = this.str('duration');
          this.insertAdjacentHTML('beforeend', `<span class="usa-vc-play" aria-hidden="true" data-usa-part></span><span class="usa-vc-time" data-usa-part>${dur}</span><span class="usa-vc-bar" aria-hidden="true" data-usa-part><i></i></span>`);
          const time = this.querySelector('.usa-vc-time') as HTMLElement;
          const bar = this.querySelector('.usa-vc-bar i') as HTMLElement;
          if (v && !dur) this.listen(v, 'loadedmetadata', () => (time.textContent = fmt(v.duration)));
          if (v) this.listen(v, 'timeupdate', () => v.duration && bar.style.setProperty('--p', String(v.currentTime / v.duration)));
          const start = () => {
            if (this._on || this.reduced) return;
            this._on = true;
            this.setAttribute('data-previewing', '');
            const p = v?.play?.();
            if (p && typeof p.catch === 'function') p.catch(() => this.setAttribute('data-noplay', ''));
            if (!v) this.setAttribute('data-noplay', '');
          };
          const stop = () => {
            if (!this._on) return;
            this._on = false;
            this.removeAttribute('data-previewing');
            if (v) {
              v.pause?.();
              try {
                v.currentTime = 0;
              } catch {
                /* not loaded */
              }
            }
            bar.style.setProperty('--p', '0');
          };
          this.listen(this, 'pointerenter', start);
          this.listen(this, 'pointerleave', stop);
          this.listen(this, 'focusin', start);
          this.listen(this, 'focusout', stop);
          this.listen(this, 'click', () => this.emit('open', { src: v?.currentSrc || v?.getAttribute('src') || '' }));
          this.listen(this, 'keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.emit('open', { src: v?.currentSrc || v?.getAttribute('src') || '' });
            }
          });
          this.onCleanup(stop);
        }
      }
      return UsaVideoCard as unknown as CustomElementConstructor;
    },
    { id: 'video-card', text: css }
  );
}
