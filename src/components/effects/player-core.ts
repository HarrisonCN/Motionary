/**
 * 14.0: the `<usa-player>` runtime without the Scene Format v2 loader — animation JSON v1
 * normalisation and the WAAPI player. `./player` adds the scene v2 loader (`createPlayer`,
 * `<usa-player>`); widgets that only build animation JSON v1 (the keyframe editor) import this.
 */
import { raf as sraf, caf as scaf } from '../base';
import { playEffect } from '../fx/registry';
import { prefersReducedMotion } from '../base';
import { TIMELINE_PRESETS } from '../timeline/core';

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

/** @internal 14.0: set by `installCompatV13()` (motionary/compat-v13) to read removed 13.x documents again. */
let legacy: ((d: any) => AnimationJSON | null) | undefined;
/** @internal used by motionary/compat-v13; returns an uninstall. */
export function setLegacyAnimationLoader(fn?: (d: any) => AnimationJSON | null): () => void {
  legacy = fn;
  return () => {
    if (legacy === fn) legacy = undefined;
  };
}

/** @internal Parse + normalise any document `<usa-player>` reads (scene v2, timeline v1, animation JSON v1). */
export function normalizePlayable(input: string | AnimationJSON | Record<string, any>, scene?: (d: any) => AnimationJSON): Required<Pick<AnimationJSON, 'tracks' | 'duration' | 'loop' | 'name'>> {
  let d: any = typeof input === 'string' ? JSON.parse(input) : input;
  if (!d || typeof d !== 'object') throw new Error('[motionary] animation: expected an object');
  if (scene && (d.format === 'motionary-scene' || d.format === 'motionary-timeline')) d = scene(d);
  else {
    d = legacy?.(d) || d;
    if (d.format === 'use-scroll-animate/playground' || (d.format === undefined && d.version === undefined && Array.isArray(d.tracks)))
      throw new Error(`[motionary] animation: ${d.format ? 'playground documents' : 'animation JSON without "format" / "version"'} were removed in 14.0 — convert with \`npx motionary migrate\` (scene v2), or read them with installCompatV13() from motionary/compat-v13`);
    if (!Array.isArray(d.tracks)) throw new Error('[motionary] animation: missing "tracks"');
    if (d.format !== ANIMATION_FORMAT) throw new Error(`[motionary] animation: unknown format "${d.format}"`);
    if (d.version > 1) throw new Error(`[motionary] animation: version ${d.version} needs a newer motionary`);
  }
  const out = (d.tracks as AnimationTrack[])
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

export interface PlayerOptions { autoplay?: boolean; loop?: boolean; rate?: number; onFinish?: () => void }

/** @internal `createPlayer` without the scene v2 loader (animation JSON v1 only; used by `<usa-kf-editor>`). */
export function createPlayerCore(root: HTMLElement, animation: string | AnimationJSON, o: PlayerOptions = {}, scene?: (d: any) => AnimationJSON): Player {
  const a = normalizePlayable(animation, scene);
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
    raf = sraf(frame);
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
      raf = sraf(frame);
    },
    pause() {
      playing = false;
      scaf(raf);
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

