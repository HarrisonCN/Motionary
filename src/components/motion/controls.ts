/**
 * 14.0 Motion Engine v2 — the one controller every animation and composition returns.
 *
 * A motion is a *node*: a span `d` (ms) and `r(t)`, which renders the state at local time `t`
 * (t < 0: not started; t > d: held at the end). Leaves render DOM elements (paused WAAPI
 * animations whose `currentTime` the controller sets), plain objects or callbacks; compositions
 * render their children at offsets. The controller owns time: it advances on the shared frame
 * scheduler (`onFrame`, 13.4) with the 8.0 motion clock's scaled `dt`, so pausing or slowing the
 * clock applies, and nothing runs its own requestAnimationFrame loop.
 */
import { onFrame, prefersReducedMotion } from '../base';

/** @internal A renderable span of motion. */
export interface MotionNode {
  /** Length in ms (one pass including delay / endDelay, times repeats). */
  d: number;
  /** Render local time `t`. */
  r(t: number): void;
  /** Drop rendered effects (WAAPI animations). */
  x?(): void;
}

export type MotionPlayState = 'idle' | 'running' | 'paused' | 'finished';

/** The one controller interface of Motion Engine v2 (animate, sequence, parallel, stagger, spring and timeline all return it). */
export interface MotionControls {
  /** Total length in ms (`Infinity` with `repeat: Infinity`). */
  readonly duration: number;
  /** Playhead in ms; setting it seeks. */
  currentTime: number;
  /** Playhead as 0–1 of `duration`; setting it seeks. */
  progress: number;
  /** Speed and direction (negative = reversed). Default 1. */
  playbackRate: number;
  readonly playState: MotionPlayState;
  /** Resolves (with these controls) when playback reaches its end — or 0 when reversed; rejects with an `AbortError` on `cancel()`. A new promise after each finish. */
  readonly finished: Promise<MotionControls>;
  play(): MotionControls;
  pause(): MotionControls;
  /** Jump to `ms` (clamped to 0–duration) and render it. */
  seek(ms: number): MotionControls;
  /** Flip the direction (and play). */
  reverse(): MotionControls;
  /** Jump to the end (or 0 when reversed) and resolve `finished`. */
  finish(): MotionControls;
  /** Stop, remove every effect this motion applied, reject `finished`. */
  cancel(): void;
}

export interface ControlOptions {
  /** Start playing right away (default `true`). */
  autoplay?: boolean;
  /** Speed (default 1; negative plays backwards). */
  playbackRate?: number;
  /** `'respect'` (default): under `prefers-reduced-motion` playing jumps to the end. `'ignore'`: always animate. */
  reducedMotion?: 'respect' | 'ignore';
  /** Called after each rendered frame / seek with the 0–1 progress. */
  onUpdate?: (progress: number) => void;
  /** Called when playback finishes. */
  onComplete?: () => void;
}

/** @internal node + controls, so compositions can adopt children. */
export interface Ctl extends MotionControls {
  /** @internal */ _n: MotionNode;
  /** @internal stop driving it (a parent adopted it). */ _a(): void;
}

const abort = (): Error => {
  const e = new Error('Motion cancelled');
  e.name = 'AbortError';
  return e;
};

/** @internal Wrap a node in controls. */
export function control(node: MotionNode, o: ControlOptions = {}): Ctl {
  let time = 0;
  let rate = o.playbackRate ?? 1;
  let state: MotionPlayState = 'idle';
  let stop: (() => void) | null = null;
  let adopted = false;
  let res!: (c: MotionControls) => void;
  let rej!: (e: Error) => void;
  let fin!: Promise<MotionControls>;
  let settled = false;
  const fresh = () => {
    settled = false;
    fin = new Promise<MotionControls>((a, b) => ((res = a), (rej = b)));
    fin.catch(() => undefined); // unhandled only if someone awaits it
  };
  fresh();
  const D = node.d;
  const halt = () => {
    stop?.();
    stop = null;
  };
  const render = () => {
    node.r(time);
    o.onUpdate?.(D ? Math.min(1, time / D) : 1);
  };
  const set = (ms: number) => {
    time = Math.min(D, Math.max(0, Number(ms) || 0));
    render();
  };
  const done = () => {
    halt();
    state = 'finished';
    settled = true;
    o.onComplete?.();
    res(c);
  };
  const atEnd = () => (rate < 0 ? time <= 0 : time >= D);
  const c: Ctl = {
    _n: node,
    _a() {
      adopted = true;
      halt();
      state = 'idle';
    },
    get duration() {
      return D;
    },
    get currentTime() {
      return time;
    },
    set currentTime(ms: number) {
      c.seek(ms);
    },
    get progress() {
      return D === Infinity ? 0 : D ? time / D : 1;
    },
    set progress(p: number) {
      c.seek(p * D);
    },
    get playbackRate() {
      return rate;
    },
    set playbackRate(r: number) {
      if (Number.isFinite(r)) rate = r;
    },
    get playState() {
      return state;
    },
    get finished() {
      return fin;
    },
    play() {
      if (adopted) return c;
      if (o.reducedMotion !== 'ignore' && prefersReducedMotion()) return c.finish();
      if (state === 'running') return c;
      if (settled) fresh();
      if (state === 'finished' || atEnd()) set(rate < 0 ? D : 0);
      state = 'running';
      stop = onFrame((_t, dt) => {
        set(time + dt * rate);
        if (atEnd()) done();
      });
      return c;
    },
    pause() {
      halt();
      if (state !== 'idle' || time) state = 'paused';
      return c;
    },
    seek(ms: number) {
      set(ms);
      if (state === 'finished') state = 'paused';
      return c;
    },
    reverse() {
      rate = -rate || -1;
      if (state === 'idle' && !time && rate < 0) set(D);
      halt();
      state = 'paused';
      return c.play();
    },
    finish() {
      if (D === Infinity) return c;
      set(rate < 0 ? 0 : D);
      done();
      return c;
    },
    cancel() {
      halt();
      node.x?.();
      time = 0;
      state = 'idle';
      if (settled) fresh();
      rej(abort());
      fresh();
    },
  };
  if (o.autoplay !== false) c.play();
  return c;
}

/** @internal Repeat / alternate a node (`repeat` = extra passes). */
export function loop(n: MotionNode, repeat = 0, alternate = false): MotionNode {
  if (!(repeat > 0)) return n;
  const d = n.d;
  return {
    d: repeat === Infinity ? Infinity : d * (repeat + 1),
    r(t) {
      if (t <= 0 || !d) return n.r(t <= 0 ? t : d);
      const total = d * (repeat + 1);
      if (t >= total) {
        const i = repeat; // last pass
        return n.r(alternate && i % 2 ? 0 : d);
      }
      const i = Math.floor(t / d);
      const lt = t - i * d;
      n.r(alternate && i % 2 ? d - lt : lt);
    },
    x: n.x,
  };
}

/** @internal Children at offsets; rendered in start order so later-starting children win. */
export function group(items: [Ctl, number][], o: ControlOptions & { repeat?: number; alternate?: boolean } = {}): Ctl {
  for (const [ch] of items) {
    if (ch._n.d === Infinity) throw new Error('[motionary] motion: a child with infinite repeat cannot be composed');
    ch._a();
  }
  const list = items.map(([ch, at]) => [ch._n, Math.max(0, at)] as const).sort((a, b) => a[1] - b[1]);
  const node: MotionNode = {
    d: list.reduce((m, [n, at]) => Math.max(m, at + n.d), 0),
    r(t) {
      for (const [n, at] of list) n.r(Math.min(t - at, n.d));
    },
    x() {
      for (const [n] of list) n.x?.();
    },
  };
  return control(loop(node, o.repeat, o.alternate), o);
}
