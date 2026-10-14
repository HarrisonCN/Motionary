/**
 * 5.9 — `<usa-player>`: plays JSON animations.
 *
 * Format `use-scroll-animate/animation` v1:
 *
 * ```json
 * { "format": "use-scroll-animate/animation", "version": 1, "name": "Hero",
 *   "loop": false,
 *   "tracks": [
 *     { "target": "h1", "start": 0, "duration": 600, "preset": "fade-up" },
 *     { "target": ".cta", "start": 500, "duration": 500, "keyframes": [{ "opacity": 0 }, { "opacity": 1 }], "easing": "ease-out" },
 *     { "target": ".cta", "start": 1100, "effect": "jelly", "options": {} }
 *   ] }
 * ```
 *
 * A track animates `target` (a selector inside the player; `:scope` for the
 * player itself) with a timeline preset, its own keyframes, or fires any
 * registered effect at `start`.
 *
 * 14.0: Scene Format v2 (`motionary-scene` v2) is read natively, and
 * `motionary-timeline` v1 through auto-migration. The playground format and
 * animation JSON without `format` / `version` were removed (convert with
 * `npx motionary migrate`, or `installCompatV13()` from `motionary/compat-v13`).
 *
 * Keyframe tracks are WAAPI animations driven by one clock, so the player can
 * play, pause, seek, change rate and be scrubbed by scroll
 * (`trigger="scroll"`). Reduced motion: jumps to the end state, effects skipped.
 */
import { raf as sraf, caf as scaf } from '../base';
import { defineElement, type UsaElement } from '../base';
import { storyProgress } from './story';
import { sceneToAnimation } from '../scene/play';
import { createPlayerCore, normalizePlayable as normalizeCore } from './player-core';
import type { AnimationJSON, Player, PlayerOptions } from './player-core';

export { ANIMATION_FORMAT } from './player-core';
export type { AnimationTrack, AnimationJSON, Player, PlayerOptions } from './player-core';

/** @internal Parse + normalise any document `<usa-player>` reads (scene v2, timeline v1, animation JSON v1). */
export function normalizePlayable(input: string | AnimationJSON | Record<string, any>): ReturnType<typeof normalizeCore> {
  return normalizeCore(input, sceneToAnimation);
}

/** Bind an animation to `root` and return its controller (paused at 0 unless `autoplay`). */
export function createPlayer(root: HTMLElement, animation: string | AnimationJSON, o: PlayerOptions = {}): Player {
  return createPlayerCore(root, animation, o, sceneToAnimation);
}

export interface UsaPlayerElement extends UsaElement {
  readonly player: Player | null;
  /** Load an animation (object or JSON text) and restart. */
  load(animation: string | AnimationJSON): void;
  play(): void;
  pause(): void;
  seek(ms: number): void;
}

/**
 * `<usa-player src="hero.json" | <script type="application/json"> child
 * trigger="load | view | scroll | click | manual" loop rate controls>`.
 * Emits `usa:ready` and `usa:finish` (12.0: legacy `usa-player-*` names gone); sets `data-error` when the
 * animation cannot be loaded.
 */
export function definePlayer(tag = 'usa-player'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaPlayer extends Base {
        static get observedAttributes(): string[] {
          return ['src', 'trigger', 'loop', 'rate', 'controls'];
        }
        player: Player | null = null;
        private json: string | AnimationJSON | null = null;
        load(animation: string | AnimationJSON): void {
          this.json = animation;
          this.start();
        }
        play(): void {
          this.player?.play();
        }
        pause(): void {
          this.player?.pause();
        }
        seek(ms: number): void {
          this.player?.seek(ms);
        }
        private start(): void {
          this.player?.destroy();
          this.player = null;
          if (!this.json) return;
          try {
            this.player = createPlayer(this, this.json, {
              loop: this.hasAttribute('loop') ? true : undefined,
              rate: this.num('rate', 1),
              onFinish: () => this.emit('finish'),
            });
            this.removeAttribute('data-error');
          } catch (err) {
            this.setAttribute('data-error', String((err as Error).message || err));
            return;
          }
          const p = this.player;
          this.emit('ready', { duration: p.duration });
          const trig = this.str('trigger', 'view');
          if (this.reduced && (trig === 'load' || trig === 'view')) p.seek(p.duration); // reduced motion: show the end state
          else if (trig === 'load') p.play();
          else if (trig === 'view') this.inView((v) => v && p.play(), { threshold: 0.25 });
          else if (trig === 'click') this.listen(this, 'click', () => (p.playing ? p.pause() : p.play()));
          else if (trig === 'scroll') {
            let f = 0;
            const upd = () => {
              f = 0;
              p.seek(storyProgress(this) * p.duration);
            };
            const kick = () => void (f ||= sraf(upd));
            this.listen(window, 'scroll', kick, { passive: true });
            this.listen(window, 'resize', kick);
            this.onCleanup(() => scaf(f));
            upd();
          }
          if (this.flag('controls')) this.mountControls(p);
        }
        private mountControls(p: Player): void {
          const b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('data-player-toggle', '');
          b.textContent = '▶︎ / ❚❚';
          b.setAttribute('aria-label', 'Play / pause animation');
          this.listen(b, 'click', (e: Event) => {
            e.stopPropagation();
            if (p.playing) p.pause();
            else p.play();
            b.setAttribute('aria-pressed', String(p.playing));
          });
          this.append(b);
          this.onCleanup(() => b.remove());
        }
        changed(name: string): void {
          if (name === 'src') this.json = null;
          super.changed(name);
        }
        mount(): void {
          this.onCleanup(() => {
            this.player?.destroy();
            this.player = null;
          });
          const inline = this.querySelector<HTMLScriptElement>('script[type="application/json"]');
          const src = this.str('src');
          if (inline && !this.json) this.json = inline.textContent || '';
          if (src && !this.json) {
            fetch(src)
              .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
              .then((t) => this.isConnected && this.load(t))
              .catch((err) => this.setAttribute('data-error', String(err.message || err)));
            return;
          }
          this.start();
        }
      },
    { id: 'usa-player', text: 'usa-player{display:block;position:relative}usa-player>script{display:none}usa-player [data-player-toggle]{position:absolute;right:8px;bottom:8px}' }
  );
}
