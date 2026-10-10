import { defineElement, type UsaElement } from '../base';
import { createPlayer, ANIMATION_FORMAT, type AnimationJSON, type Player } from '../effects/player';
import css from './keyframe-editor.css?raw';

/**
 * `<usa-keyframe-editor>` (6.9) — animation editor 2.0: a compact timeline
 * for `<usa-player>` JSON. Each track is a row with a draggable bar (drag to
 * move, drag the right edge to resize; ← / → move by 50 ms, Shift + ← / →
 * resize); a playhead scrubs the preview, ▶ plays it. The preview target is
 * the element with id `for` (its children are the tracks' targets). Set
 * `animation` (object or JSON string, or a `<script type="application/json">`
 * child); read `animation` / `toJSON()` for the edited JSON (format
 * `use-scroll-animate/animation` v1 — playable by `<usa-player>`). Event
 * `usa:change` (`{ animation }`). Reduced motion: the preview jumps to the
 * end state.
 */
export interface UsaKeyframeEditorElement extends UsaElement {
  animation: AnimationJSON;
  toJSON(): AnimationJSON;
  play(): void;
  seek(ms: number): void;
}

const DEFAULT: AnimationJSON = {
  format: ANIMATION_FORMAT,
  version: 1,
  name: 'Untitled',
  tracks: [
    { target: ':scope > :nth-child(1)', start: 0, duration: 600, preset: 'fade-up', label: 'Title' },
    { target: ':scope > :nth-child(2)', start: 300, duration: 600, preset: 'scale', label: 'Card' },
    { target: ':scope > :nth-child(3)', start: 700, duration: 500, preset: 'fade-up', label: 'Button' },
  ],
};

export function defineKeyframeEditor(tag = 'usa-keyframe-editor'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaKeyframeEditor extends Base {
        static get observedAttributes(): string[] {
          return ['for'];
        }
        private _anim: AnimationJSON = JSON.parse(JSON.stringify(DEFAULT));
        private _player: Player | null = null;

        get animation(): AnimationJSON {
          return this.toJSON();
        }
        set animation(v: AnimationJSON | string) {
          try {
            const a = typeof v === 'string' ? JSON.parse(v) : v;
            if (a && Array.isArray(a.tracks)) this._anim = { format: ANIMATION_FORMAT, version: 1, ...JSON.parse(JSON.stringify(a)) };
          } catch {
            return;
          }
          if (this.isConnected) this.render();
        }

        toJSON(): AnimationJSON {
          return JSON.parse(JSON.stringify({ ...this._anim, duration: this.total() }));
        }

        private total(): number {
          return Math.max(500, ...this._anim.tracks.map((t) => (t.start || 0) + (t.duration || 0)));
        }

        mount(): void {
          const src = this.querySelector(':scope > script[type="application/json"]');
          if (src?.textContent) this.animation = src.textContent;
          this.querySelectorAll(':scope > [data-usa-part]').forEach((n) => n.remove());
          this.insertAdjacentHTML('afterbegin', '<div class="usa-ke-bar" data-usa-part><button type="button" class="usa-ke-play" aria-label="Play">▶</button><input class="usa-ke-scrub" type="range" min="0" max="1000" value="1000" aria-label="Playhead"><output class="usa-ke-time">0 ms</output></div><div class="usa-ke-tracks" data-usa-part role="list"></div>');
          this.listen(this.querySelector('.usa-ke-play')!, 'click', () => this.play());
          this.listen(this.querySelector('.usa-ke-scrub')!, 'input', (e: Event) => this.seek((Number((e.target as HTMLInputElement).value) / 1000) * this.total()));
          this.render();
        }

        private target(): HTMLElement | null {
          const id = this.str('for', '');
          return id ? document.getElementById(id) : null;
        }

        private rebuild(): void {
          this._player?.destroy?.();
          this._player = null;
          const t = this.target();
          if (t) this._player = createPlayer(t, this.toJSON(), { autoplay: false });
        }

        private render(): void {
          const box = this.querySelector('.usa-ke-tracks') as HTMLElement | null;
          if (!box) return;
          const total = this.total();
          box.innerHTML = '';
          this._anim.tracks.forEach((t, i) => {
            const row = document.createElement('div');
            row.className = 'usa-ke-row';
            row.setAttribute('role', 'listitem');
            row.innerHTML = `<span class="usa-ke-label"></span><span class="usa-ke-lane"><span class="usa-ke-clip" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="${total}"><span class="usa-ke-grip" aria-hidden="true"></span></span></span>`;
            (row.querySelector('.usa-ke-label') as HTMLElement).textContent = t.label || t.preset || t.effect || `Track ${i + 1}`;
            const clip = row.querySelector('.usa-ke-clip') as HTMLElement;
            clip.style.left = `${((t.start || 0) / total) * 100}%`;
            clip.style.width = `${Math.max(2, ((t.duration || 300) / total) * 100)}%`;
            clip.setAttribute('aria-valuenow', String(t.start || 0));
            clip.setAttribute('aria-label', `${(row.querySelector('.usa-ke-label') as HTMLElement).textContent}: start ${t.start || 0} ms, ${t.duration || 0} ms`);
            clip.dataset.i = String(i);
            this.wire(clip, i);
            box.appendChild(row);
          });
          this.rebuild();
        }

        private update(i: number, start: number, duration: number): void {
          const t = this._anim.tracks[i];
          t.start = Math.max(0, Math.round(start / 10) * 10);
          t.duration = Math.max(50, Math.round(duration / 10) * 10);
          this.render();
          (this.querySelector(`.usa-ke-clip[data-i="${i}"]`) as HTMLElement | null)?.focus();
          this.emit('change', { animation: this.toJSON() });
        }

        private wire(clip: HTMLElement, i: number): void {
          clip.addEventListener('keydown', (e: KeyboardEvent) => {
            const t = this._anim.tracks[i];
            const d = e.key === 'ArrowRight' ? 50 : e.key === 'ArrowLeft' ? -50 : 0;
            if (!d) return;
            e.preventDefault();
            if (e.shiftKey) this.update(i, t.start || 0, (t.duration || 300) + d);
            else this.update(i, (t.start || 0) + d, t.duration || 300);
          });
          clip.addEventListener('pointerdown', (e: PointerEvent) => {
            const lane = clip.parentElement as HTMLElement;
            const w = lane.getBoundingClientRect().width || 1;
            const total = this.total();
            const t = this._anim.tracks[i];
            const s0 = t.start || 0;
            const d0 = t.duration || 300;
            const resize = (e.target as HTMLElement).classList.contains('usa-ke-grip');
            const x0 = e.clientX;
            clip.setPointerCapture?.(e.pointerId);
            clip.toggleAttribute('data-drag', true);
            const move = (ev: PointerEvent) => {
              const dms = ((ev.clientX - x0) / w) * total;
              if (resize) clip.style.width = `${(Math.max(50, d0 + dms) / total) * 100}%`;
              else clip.style.left = `${(Math.max(0, s0 + dms) / total) * 100}%`;
            };
            const up = (ev: PointerEvent) => {
              clip.removeEventListener('pointermove', move);
              clip.removeEventListener('pointerup', up);
              clip.removeAttribute('data-drag');
              const dms = ((ev.clientX - x0) / w) * total;
              if (Math.abs(ev.clientX - x0) < 2) return;
              if (resize) this.update(i, s0, d0 + dms);
              else this.update(i, s0 + dms, d0);
            };
            clip.addEventListener('pointermove', move);
            clip.addEventListener('pointerup', up);
          });
        }

        seek(ms: number): void {
          const total = this.total();
          const v = Math.max(0, Math.min(total, ms));
          this._player?.seek?.(v);
          const out = this.querySelector('.usa-ke-time');
          if (out) out.textContent = `${Math.round(v)} ms`;
          this.style.setProperty('--usa-ke-head', `${(v / total) * 100}%`);
        }

        play(): void {
          if (!this._player) this.rebuild();
          if (this.reduced) return this.seek(this.total());
          this._player?.seek?.(0);
          this._player?.play?.();
          const t0 = performance.now();
          const total = this.total();
          const scrub = this.querySelector('.usa-ke-scrub') as HTMLInputElement | null;
          const f = () => {
            const ms = Math.min(total, performance.now() - t0);
            if (scrub) scrub.value = String(Math.round((ms / total) * 1000));
            this.style.setProperty('--usa-ke-head', `${(ms / total) * 100}%`);
            const out = this.querySelector('.usa-ke-time');
            if (out) out.textContent = `${Math.round(ms)} ms`;
            if (ms < total && this.isConnected) requestAnimationFrame(f);
          };
          if (typeof requestAnimationFrame === 'function') requestAnimationFrame(f);
        }
      }
      return UsaKeyframeEditor as unknown as CustomElementConstructor;
    },
    { id: 'keyframe-editor', text: css }
  );
}
