/**
 * The shared ticker: one requestAnimationFrame loop per page (or worker) for
 * every runtime animation, with lag smoothing and a frame budget readout.
 * Falls back to a 16 ms timer where rAF is missing (Node, some workers).
 * Nothing runs until the first listener is added (SSR-safe).
 */
import { registry } from './registry';

export type TickFn = (time: number, delta: number) => void;

export interface Ticker {
  /** Add a listener; returns a remover. */
  add(fn: TickFn): () => void;
  remove(fn: TickFn): void;
  /** ms since the ticker started (frozen while sleeping). */
  readonly time: number;
  /** Smoothed frames per second. */
  readonly fps: number;
  /** Listener count (0 = asleep). */
  readonly size: number;
  /** Cap a single frame's delta (default 100 ms) so a background tab does not jump animations. */
  lagSmoothing(maxDelta: number): void;
  /** Global time scale (1 = normal, 0.5 = half speed, 0 = frozen). */
  timeScale: number;
  /** Advance by `ms` synchronously (tests, offline rendering, worker loops). */
  step(ms: number): void;
}

function createTicker(): Ticker {
  const fns = new Set<TickFn>();
  let time = 0, last = -1, fps = 60, maxDelta = 100, handle: unknown = null;
  const g = globalThis as any;
  const now = (): number => (g.performance?.now ? g.performance.now() : Date.now());
  const raf = (cb: (t: number) => void): unknown => (typeof g.requestAnimationFrame === 'function' ? g.requestAnimationFrame(cb) : setTimeout(() => cb(now()), 16));
  const caf = (h: unknown): void => (typeof g.cancelAnimationFrame === 'function' ? g.cancelAnimationFrame(h) : clearTimeout(h as any));
  const run = (dt: number, cap = true): void => {
    const d = (cap ? Math.min(dt, maxDelta) : dt) * t.timeScale;
    time += d;
    for (const fn of Array.from(fns)) fn(time, d);
  };
  const frame = (ts: number): void => {
    handle = null;
    if (!fns.size) return;
    const n = typeof ts === 'number' && ts > 0 ? ts : now();
    const dt = last < 0 ? 0 : n - last;
    last = n;
    if (dt > 0) fps = fps * 0.9 + (1000 / dt) * 0.1;
    run(dt);
    if (fns.size) handle = raf(frame);
  };
  const wake = (): void => {
    if (handle === null && fns.size) {
      last = -1;
      handle = raf(frame);
    }
  };
  const t: Ticker = {
    add(fn) {
      fns.add(fn);
      wake();
      return () => t.remove(fn);
    },
    remove(fn) {
      fns.delete(fn);
      if (!fns.size && handle !== null) {
        caf(handle);
        handle = null;
      }
    },
    get time() { return time; },
    get fps() { return Math.round(fps); },
    get size() { return fns.size; },
    lagSmoothing(ms) { maxDelta = ms > 0 ? ms : Infinity; },
    timeScale: 1,
    step(ms) { run(ms, false); },
  };
  return t;
}

/** The page-wide ticker (shared across every copy of the runtime). */
export function getTicker(): Ticker {
  const s = registry().slots;
  return (s.ticker ||= createTicker()) as Ticker;
}
