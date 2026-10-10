import { defineElement, type UsaElement } from '../base';
import { clampN } from './shared';
import css from './music-player.css?raw';

/**
 * `<usa-music-player>` (7.1) — a music player card: the cover turns like a
 * record while playing, the play button morphs ▶ ↔ ❚❚, mini equalizer bars
 * dance, and the progress bar is a scrubbable slider (arrows ±5 s). Plays a
 * child `<audio>` (or `src`), or simulates a track of `duration` seconds for
 * demos. Attributes `title`, `artist`, `cover` (image URL), `src`,
 * `duration`. Methods `play()`, `pause()`, `toggle()`, `seek(s)`; events
 * `usa:play`, `usa:pause`, `usa:seek`, `usa:prev`, `usa:next`. Reduced
 * motion: no spin or dancing bars.
 */
export interface UsaMusicPlayerElement extends UsaElement {
  readonly playing: boolean;
  currentTime: number;
  readonly duration: number;
  play(): void;
  pause(): void;
  toggle(): void;
  seek(s: number): void;
}

const fmt = (s: number): string => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function defineMusicPlayer(tag = 'usa-music-player'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaMusicPlayer extends Base {
        static get observedAttributes(): string[] {
          return ['title', 'artist', 'cover', 'src', 'duration'];
        }
        private _audio: HTMLAudioElement | null = null;
        private _playing = false;
        private _t = 0;
        private _raf = 0;
        private _last = 0;

        get playing(): boolean {
          return this._playing;
        }
        get duration(): number {
          const d = this._audio?.duration;
          return d && Number.isFinite(d) ? d : Math.max(1, this.num('duration', 180));
        }
        get currentTime(): number {
          return this._audio ? this._audio.currentTime : this._t;
        }
        set currentTime(v: number) {
          this.seek(v);
        }

        mount(): void {
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this._audio = this.querySelector(':scope > audio');
          if (!this._audio && this.str('src', '')) {
            this._audio = document.createElement('audio');
            this._audio.src = this.str('src', '');
            this._audio.preload = 'metadata';
            this._audio.setAttribute('data-usa-part', '');
            this.appendChild(this._audio);
          }
          this.setAttribute('role', 'group');
          this.setAttribute('aria-roledescription', 'music player');
          const title = this.str('title', 'Untitled');
          const artist = this.str('artist', '');
          this.setAttribute('aria-label', artist ? `${title} — ${artist}` : title);
          const cover = this.str('cover', '');
          this.insertAdjacentHTML('afterbegin', `<div class="usa-mp-cover" data-usa-part aria-hidden="true"><span class="usa-mp-disc"${cover ? ` style="background-image:url('${cover.replace(/'/g, '%27')}')"` : ''}></span></div><div class="usa-mp-body" data-usa-part><div class="usa-mp-meta"><b class="usa-mp-title"></b><span class="usa-mp-artist"></span></div><div class="usa-mp-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="usa-mp-track" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0"><span class="usa-mp-fill"></span><span class="usa-mp-knob"></span></div><div class="usa-mp-times"><span class="usa-mp-cur">0:00</span><span class="usa-mp-dur"></span></div><div class="usa-mp-ctrls"><button type="button" class="usa-mp-btn" data-act="prev" aria-label="Previous">⏮</button><button type="button" class="usa-mp-play" data-act="play" aria-label="Play"><span class="usa-mp-icon"></span></button><button type="button" class="usa-mp-btn" data-act="next" aria-label="Next">⏭</button></div></div>`);
          (this.querySelector('.usa-mp-title') as HTMLElement).textContent = title;
          (this.querySelector('.usa-mp-artist') as HTMLElement).textContent = artist;
          this.listen(this, 'click', (e: Event) => {
            const act = (e.target as HTMLElement).closest?.('[data-act]') as HTMLElement | null;
            if (!act) return;
            if (act.dataset.act === 'play') this.toggle();
            else this.emit(act.dataset.act!, {});
          });
          const track = this.querySelector('.usa-mp-track') as HTMLElement;
          this.listen(track, 'pointerdown', (e: PointerEvent) => {
            const at = (ev: PointerEvent) => {
              const r = track.getBoundingClientRect();
              this.seek(clampN((ev.clientX - r.left) / (r.width || 1), 0, 1) * this.duration);
            };
            at(e);
            track.setPointerCapture?.(e.pointerId);
            const up = () => (track.removeEventListener('pointermove', at), track.removeEventListener('pointerup', up));
            track.addEventListener('pointermove', at);
            track.addEventListener('pointerup', up);
          });
          this.listen(track, 'keydown', (e: KeyboardEvent) => {
            const d = e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0;
            if (!d) return;
            e.preventDefault();
            this.seek(this.currentTime + d);
          });
          if (this._audio) {
            this.listen(this._audio, 'timeupdate', () => this.sync());
            this.listen(this._audio, 'loadedmetadata', () => this.sync());
            this.listen(this._audio, 'ended', () => this.pause());
          }
          this.onCleanup(() => cancelAnimationFrame(this._raf));
          this.sync();
        }

        private sync(): void {
          const d = this.duration;
          const t = this.currentTime;
          this.style.setProperty('--usa-mp-p', String(clampN(t / d, 0, 1)));
          const cur = this.querySelector('.usa-mp-cur');
          if (cur) cur.textContent = fmt(t);
          const dur = this.querySelector('.usa-mp-dur');
          if (dur) dur.textContent = fmt(d);
          const tr = this.querySelector('.usa-mp-track');
          tr?.setAttribute('aria-valuemax', String(Math.round(d)));
          tr?.setAttribute('aria-valuenow', String(Math.round(t)));
          tr?.setAttribute('aria-valuetext', `${fmt(t)} of ${fmt(d)}`);
          this.toggleAttribute('data-playing', this._playing);
          this.toggleAttribute('data-animate', this._playing && !this.reduced);
          const b = this.querySelector('.usa-mp-play');
          b?.setAttribute('aria-label', this._playing ? 'Pause' : 'Play');
          b?.setAttribute('aria-pressed', String(this._playing));
        }

        private tick = (now: number): void => {
          if (!this._playing) return;
          if (!this._audio) {
            this._t += this._last ? (now - this._last) / 1000 : 0;
            this._last = now;
            if (this._t >= this.duration) {
              this._t = this.duration;
              this.sync();
              return this.pause();
            }
            this.sync();
          }
          this._raf = requestAnimationFrame(this.tick);
        };

        play(): void {
          if (this._playing) return;
          this._playing = true;
          if (this._audio) void this._audio.play()?.catch?.(() => undefined);
          this._last = 0;
          if (typeof requestAnimationFrame === 'function') this._raf = requestAnimationFrame(this.tick);
          this.sync();
          const icon = this.querySelector('.usa-mp-play');
          if (icon && !this.reduced) this.motion(icon, [{ transform: 'scale(.85)' }, { transform: 'scale(1.08)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
          this.emit('play', {});
        }
        pause(): void {
          if (!this._playing) return;
          this._playing = false;
          this._audio?.pause();
          cancelAnimationFrame(this._raf);
          this.sync();
          this.emit('pause', {});
        }
        toggle(): void {
          if (this._playing) this.pause();
          else this.play();
        }
        seek(s: number): void {
          const t = clampN(s, 0, this.duration);
          if (this._audio) this._audio.currentTime = t;
          else this._t = t;
          this.sync();
          this.emit('seek', { time: t });
        }
      }
      return UsaMusicPlayer as unknown as CustomElementConstructor;
    },
    { id: 'music-player', text: css }
  );
}
