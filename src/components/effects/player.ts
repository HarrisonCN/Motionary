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
 * registered effect at `start`. Playground presets (format
 * `use-scroll-animate/playground`) are accepted too — their tracks map to the
 * player's children in order.
 *
 * Keyframe tracks are WAAPI animations driven by one clock, so the player can
 * play, pause, seek, change rate and be scrubbed by scroll
 * (`trigger="scroll"`). Reduced motion: jumps to the end state, effects skipped.
 */
import { playEffect } from '../fx/registry';
import { defineElement, prefersReducedMotion, type UsaElement } from '../base';
import { TIMELINE_PRESETS } from '../timeline/core';
import { storyProgress } from './story';

export interface AnimationTrack {
  /** Selector inside the player (`:scope` = the player). */
  target?: string;
  /** Start time in ms. */
  start?: number;
  duration?: number;
  /** A timeline preset (`fade-up`, `scale`, `blur`…). */
  preset?: string;
  keyframes?: Keyframe[];
  easing?: string;
  /** A registered effect fired at `start` (instead of keyframes). */
  effect?: string;
  options?: Record<string, unknown>;
  label?: string;
}

export interface AnimationJSON {
  format?: string;
  version?: number;
  name?: string;
  loop?: boolean;
  /** Total length; defaults to the end of the last track. */
  duration?: number;
  tracks: AnimationTrack[];
}

export const ANIMATION_FORMAT = 'use-scroll-animate/animation';

function decodePlayground(state: string): AnimationTrack[] {
  try {
    const b64 = state.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    const t = (JSON.parse(json).t || []) as [string, number, number, string][];
    return t.map(([preset, start, duration, label], i) => ({ target: `:scope > :nth-child(${i + 1})`, preset, start, duration, label }));
  } catch {
    return [];
  }
}

/** Validate / normalise an animation (object or JSON text). Throws on anything unusable. */
export function normalizeAnimation(input: string | AnimationJSON | Record<string, any>): Required<Pick<AnimationJSON, 'tracks' | 'duration' | 'loop' | 'name'>> {
  const d: any = typeof input === 'string' ? JSON.parse(input) : input;
  if (!d || typeof d !== 'object') throw new Error('[motionary] animation: expected an object');
  let tracks: AnimationTrack[];
  if (d.format === 'use-scroll-animate/playground') tracks = decodePlayground(String(d.state || ''));
  else if (Array.isArray(d.tracks)) tracks = d.tracks;
  else throw new Error('[motionary] animation: missing "tracks"');
  if (d.format && d.format !== ANIMATION_FORMAT && d.format !== 'use-scroll-animate/playground') throw new Error(`[motionary] animation: unknown format "${d.format}"`);
  if (d.version && d.version > 1 && d.format === ANIMATION_FORMAT) throw new Error(`[motionary] animation: version ${d.version} needs a newer motionary`);
  const out = tracks
    .filter((t) => t && (t.effect || t.preset || Array.isArray(t.keyframes)))
    .map((t) => ({ ...t, target: t.target || ':scope', start: Math.max(0, Number(t.start) || 0), duration: t.effect ? 0 : Math.max(1, Number(t.duration) || 600) }));
  const end = out.reduce((m, t) => Math.max(m, t.start + t.duration), 0);
  return { tracks: out, duration: Math.max(end, Number(d.duration) || 0), loop: !!d.loop, name: String(d.name || 'animation') };
}

export interface Player {
  readonly duration: number;
  readonly currentTime: number;
  readonly playing: boolean;
  play(): void;
  pause(): void;
  /** Jump to `ms` (effects between are not replayed). */
  seek(ms: number): void;
  /** Playback rate (default 1). */
  rate: number;
  /** Resolves each time the animation reaches its end (not when looping). */
  readonly finished: Promise<void>;
  destroy(): void;
}

const pick = (root: HTMLElement, sel: string): HTMLElement[] => {
  if (sel === ':scope') return [root];
  try {
    return Array.from(root.querySelectorAll<HTMLElement>(sel));
  } catch {
    return [];
  }
};

/** Bind an animation to `root` and return its controller (paused at 0 unless `autoplay`). */
export function createPlayer(root: HTMLElement, animation: string | AnimationJSON, o: { autoplay?: boolean; loop?: boolean; rate?: number; onFinish?: () => void } = {}): Player {
  const a = normalizeAnimation(animation);
  const loop = o.loop ?? a.loop;
  const anims: Animation[] = [];
  const effects: { els: HTMLElement[]; t: AnimationTrack; fired: boolean }[] = [];
  for (const t of a.tracks) {
    const els = pick(root, t.target!);
    if (t.effect) effects.push({ els, t, fired: false });
    else {
      const kf = t.keyframes || TIMELINE_PRESETS[t.preset!] || TIMELINE_PRESETS.fade;
      for (const el of els) {
        if (typeof el.animate !== 'function') continue;
        const an = el.animate(kf, { duration: t.duration, delay: t.start, easing: t.easing || 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' });
        an.pause();
        an.currentTime = 0;
        anims.push(an);
      }
    }
  }
  let time = 0;
  let playing = false;
  let raf = 0;
  let last = 0;
  let resolve!: () => void;
  let finished = new Promise<void>((r) => (resolve = r));
  const set = (ms: number) => {
    time = Math.min(a.duration, Math.max(0, ms));
    for (const an of anims) an.currentTime = time;
  };
  const fireDue = () => {
    if (prefersReducedMotion()) return;
    for (const e of effects)
      if (!e.fired && time >= e.t.start!) {
        e.fired = true;
        for (const el of e.els) playEffect(el, e.t.effect!, e.t.options || {}).catch(() => undefined);
      }
  };
  const done = () => {
    resolve();
    o.onFinish?.();
    finished = new Promise<void>((r) => (resolve = r));
  };
  const frame = (now: number) => {
    raf = 0;
    if (!playing) return;
    set(time + (now - last) * player.rate);
    last = now;
    fireDue();
    if (time >= a.duration) {
      if (loop) {
        effects.forEach((e) => (e.fired = false));
        set(0);
      } else {
        playing = false;
        done();
        return;
      }
    }
    raf = requestAnimationFrame(frame);
  };
  const player: Player = {
    get duration() {
      return a.duration;
    },
    get currentTime() {
      return time;
    },
    get playing() {
      return playing;
    },
    rate: o.rate ?? 1,
    get finished() {
      return finished;
    },
    play() {
      if (prefersReducedMotion()) {
        set(a.duration);
        effects.forEach((e) => (e.fired = true));
        done();
        return;
      }
      if (playing) return;
      if (time >= a.duration) {
        effects.forEach((e) => (e.fired = false));
        set(0);
      }
      playing = true;
      last = performance.now();
      fireDue();
      raf = requestAnimationFrame(frame);
    },
    pause() {
      playing = false;
      cancelAnimationFrame(raf);
      raf = 0;
    },
    seek(ms: number) {
      set(ms);
      effects.forEach((e) => (e.fired = e.t.start! < time));
    },
    destroy() {
      player.pause();
      anims.forEach((an) => an.cancel());
    },
  };
  if (o.autoplay) player.play();
  return player;
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
            const kick = () => void (f ||= requestAnimationFrame(upd));
            this.listen(window, 'scroll', kick, { passive: true });
            this.listen(window, 'resize', kick);
            this.onCleanup(() => cancelAnimationFrame(f));
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
