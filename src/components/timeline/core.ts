import { prefersReducedMotion, motionScale, applyFrame, raf, caf, now, clamp } from '../base';
import { resolveDurationToken, resolveEasingToken } from '../tokens/index';

/**
 * Where a step starts on a timeline:
 * - a number: absolute time in ms
 * - `'>'` (default): when the previous step ends · `'<'`: when it starts
 * - `'+=200'` / `'-=200'`: after / overlapping the previous end
 * - `'<+=100'`: 100ms after the previous step's start
 * - `'intro'` / `'intro+=150'`: at (or relative to) a label
 */
export type TimelinePosition = number | string;

export interface TimelineStepOptions {
  /** Duration in ms or a motion token name (`'fast'`, `'slow'`…; 4.2). Default: timeline default, 600. */
  duration?: number | string;
  /** CSS easing or a motion token name (`'emphasized'`, `'spring'`…; 4.2). Default `cubic-bezier(0.22, 1, 0.36, 1)`. */
  easing?: string;
  /** Start position, see `TimelinePosition`. */
  at?: TimelinePosition;
  /** ms between targets when the selector matches several elements. */
  stagger?: number;
}

export interface TimelineOptions {
  /** Defaults for every step. */
  defaults?: Pick<TimelineStepOptions, 'duration' | 'easing' | 'stagger'>;
  /** Playback rate (1 = normal). */
  speed?: number;
  /** Called after `play()` reaches the end (or the start when reversed). */
  onComplete?: () => void;
  /** Called on every frame with progress 0–1. */
  onUpdate?: (progress: number) => void;
}

export interface ScrubOptions {
  /** Scroll offset (px) before the source's top reaches the viewport bottom where progress starts (JS engine only). */
  offset?: number;
  /** Smoothing 0–1 (0 = immediate, default 0). Smoothing needs the JS engine. */
  smooth?: number;
  /**
   * 4.1: which progress source drives the timeline.
   * - `'view'` (default): `source` moving through the viewport (CSS `ViewTimeline`, range `cover`).
   * - `'scroll'`: the scroll position of `source` itself (a scroll container; CSS `ScrollTimeline`).
   */
  source?: 'view' | 'scroll';
  /** 4.1: `'auto'` (default) uses the browser's native scroll-driven animations when available, `'js'` forces the fallback. */
  engine?: 'auto' | 'native' | 'js';
  /** 4.1: scroll axis, `'block'` (default) · `'inline'` · `'x'` · `'y'`. */
  axis?: 'block' | 'inline' | 'x' | 'y';
}

/** The function `scrub()` returns: call it to stop. `native` tells which engine runs it. */
export interface ScrubHandle {
  (): void;
  /** `true` when the browser's ScrollTimeline / ViewTimeline drives it (compositor, no JS per frame). */
  readonly native: boolean;
}

/** 4.1: whether `scrub()` can use native ScrollTimeline / ViewTimeline here. */
export function supportsNativeScrub(source: 'view' | 'scroll' = 'view'): boolean {
  const g = globalThis as any;
  return typeof g[source === 'scroll' ? 'ScrollTimeline' : 'ViewTimeline'] === 'function' && typeof g.Element?.prototype?.animate === 'function';
}

const handle = (stop: () => void, native: boolean): ScrubHandle => Object.assign(stop, { native }) as ScrubHandle;

export interface Timeline {
  /** Total length in ms. */
  readonly duration: number;
  /** Label positions in ms. */
  readonly labels: Readonly<Record<string, number>>;
  /** Current playhead in ms. */
  readonly time: number;
  /** Add a step: animate `target` with keyframes or a preset name (`fade-up`, `scale`…). */
  to(target: string | Element | Element[] | NodeList, frames: Keyframe[] | string, options?: TimelineStepOptions): Timeline;
  /** Name a position (default: the current end). */
  label(name: string, at?: TimelinePosition): Timeline;
  /** Run `fn` when the playhead passes `at`. */
  call(fn: () => void, at?: TimelinePosition): Timeline;
  /** Play forwards from the playhead (from 0 when at the end). Resolves at the end. */
  play(from?: TimelinePosition): Promise<void>;
  /** Play backwards to 0. */
  reverse(): Promise<void>;
  pause(): Timeline;
  /** Jump to a time (ms) or label. */
  seek(to: TimelinePosition): Timeline;
  /** Get or set progress 0–1. */
  progress(p?: number): number;
  /**
   * Tie progress to scroll: `source` moving through the viewport (or, with
   * `{ source: 'scroll' }`, a scroll container's own position). Runs on native
   * ScrollTimeline / ViewTimeline when available (and no `smooth`, `offset`,
   * `call()` cues or `onUpdate` need JS), else on a rAF-throttled listener.
   * Returns a stop function with a `native` flag.
   */
  scrub(source: Element, options?: ScrubOptions): ScrubHandle;
  /** Stop and drop every animation (elements keep their last frame). */
  cancel(): void;
}

/** Keyframe presets usable by name in `to()` and `data-tl`. */
export const TIMELINE_PRESETS: Record<string, Keyframe[]> = {
  fade: [{ opacity: 0 }, { opacity: 1 }],
  'fade-up': [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }],
  'fade-down': [{ opacity: 0, transform: 'translateY(-24px)' }, { opacity: 1, transform: 'none' }],
  'fade-left': [{ opacity: 0, transform: 'translateX(24px)' }, { opacity: 1, transform: 'none' }],
  'fade-right': [{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }],
  scale: [{ opacity: 0, transform: 'scale(0.85)' }, { opacity: 1, transform: 'none' }],
  blur: [{ opacity: 0, filter: 'blur(12px)' }, { opacity: 1, filter: 'blur(0)' }],
  rotate: [{ opacity: 0, transform: 'rotate(-12deg) scale(0.9)' }, { opacity: 1, transform: 'none' }],
  'clip-up': [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
  'clip-right': [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
};

/** Resolve a position against the previous step and labels (pure). */
export function resolvePosition(
  pos: TimelinePosition | undefined,
  end: number,
  prevStart: number,
  labels: Record<string, number> = {}
): number {
  if (pos === undefined || pos === '' || pos === '>') return end;
  if (typeof pos === 'number') return Math.max(0, pos);
  const s = String(pos).trim();
  if (/^-?\d+(\.\d+)?$/.test(s)) return Math.max(0, Number(s));
  const m = /^(<|>|[A-Za-z_][\w-]*)?\s*(?:([+-])=\s*(\d+(?:\.\d+)?))?$/.exec(s);
  if (!m) return end;
  const base = m[1] === '<' ? prevStart : m[1] === '>' || !m[1] ? end : labels[m[1]] ?? end;
  const delta = m[2] ? (m[2] === '-' ? -1 : 1) * Number(m[3]) : 0;
  return Math.max(0, base + delta);
}

const toEls = (t: string | Element | Element[] | NodeList): Element[] =>
  typeof t === 'string' ? (typeof document === 'undefined' ? [] : Array.from(document.querySelectorAll(t))) : t instanceof Element ? [t] : Array.from(t as ArrayLike<Element>);

interface Step { el: Element; frames: Keyframe[]; start: number; duration: number; easing: string; anim?: Animation | null }
interface Cue { fn: () => void; at: number }

/**
 * Choreograph animations on one clock: chain, overlap, label, seek, reverse and
 * scrub them with scroll. Built on WAAPI (paused animations driven by one
 * playhead); without WAAPI or under reduced motion it jumps to the end state.
 *
 * @example
 * const tl = timeline({ defaults: { duration: 500 } })
 *   .to('.title', 'fade-up')
 *   .label('cards')
 *   .to('.card', 'scale', { stagger: 80, at: '-=200' })
 *   .to('.cta', [{ opacity: 0 }, { opacity: 1 }], { at: 'cards+=400' });
 * tl.play();             // or tl.scrub(document.querySelector('.hero'))
 */
export function timeline(options: TimelineOptions = {}): Timeline {
  const d = { duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', stagger: 0, ...options.defaults };
  const steps: Step[] = [];
  const cues: Cue[] = [];
  const labels: Record<string, number> = {};
  let end = 0;
  let prevStart = 0;
  let t = 0;
  let frame = 0;
  let dir = 1;
  let settle: (() => void) | undefined;
  let built = false;

  const total = () => Math.max(end, ...cues.map((c) => c.at), 0);
  const build = () => {
    if (built) return;
    built = true;
    for (const s of steps) {
      if (typeof (s.el as HTMLElement).animate !== 'function') { s.anim = null; continue; }
      s.anim = (s.el as HTMLElement).animate(s.frames, { duration: s.duration, delay: s.start, easing: s.easing, fill: 'both' });
      s.anim.pause?.();
    }
  };
  const render = (to: number, from: number) => {
    build();
    t = clamp(to, 0, total());
    for (const s of steps) {
      if (s.anim) s.anim.currentTime = t;
      else applyFrame(s.el as HTMLElement, s.frames[t >= s.start ? s.frames.length - 1 : 0]);
    }
    for (const c of cues) if ((from < c.at && t >= c.at) || (from > c.at && t <= c.at)) c.fn();
    options.onUpdate?.(total() ? t / total() : 1);
  };
  const stop = () => {
    if (frame) caf(frame);
    frame = 0;
  };
  const run = (direction: number): Promise<void> => {
    stop();
    settle?.();
    dir = direction;
    const target = dir > 0 ? total() : 0;
    const k = motionScale();
    if (prefersReducedMotion() || k === 0 || !total()) {
      render(target, t);
      options.onComplete?.();
      return Promise.resolve();
    }
    const rate = (options.speed ?? 1) / k;
    return new Promise<void>((resolve) => {
      settle = () => { settle = undefined; resolve(); };
      let last = now();
      const loop = () => {
        const n = now();
        const next = t + (n - last) * rate * dir;
        last = n;
        render(next, t);
        if ((dir > 0 && t >= target) || (dir < 0 && t <= 0)) {
          frame = 0;
          options.onComplete?.();
          settle?.();
          return;
        }
        frame = raf(loop);
      };
      frame = raf(loop);
    });
  };

  const api: Timeline = {
    get duration() { return total(); },
    get labels() { return { ...labels }; },
    get time() { return t; },
    to(target, frames, o = {}) {
      const kf = typeof frames === 'string' ? TIMELINE_PRESETS[frames] || TIMELINE_PRESETS.fade : frames;
      const start = resolvePosition(o.at, end, prevStart, labels);
      const duration = resolveDurationToken(o.duration ?? d.duration, 600);
      const stagger = o.stagger ?? d.stagger;
      let last = start;
      toEls(target).forEach((el, i) => {
        const s = start + i * stagger;
        steps.push({ el, frames: kf, start: s, duration, easing: resolveEasingToken(o.easing ?? d.easing, 'cubic-bezier(0.22, 1, 0.36, 1)') });
        last = Math.max(last, s + duration);
      });
      prevStart = start;
      end = Math.max(end, last);
      built = false;
      steps.forEach((s) => s.anim?.cancel?.());
      return api;
    },
    label(name, at) {
      labels[name] = resolvePosition(at, end, prevStart, labels);
      return api;
    },
    call(fn, at) {
      cues.push({ fn, at: resolvePosition(at, end, prevStart, labels) });
      return api;
    },
    play(from) {
      if (from !== undefined) render(resolvePosition(from, 0, 0, labels), t);
      else if (t >= total()) render(0, -1);
      return run(1);
    },
    reverse() {
      return run(-1);
    },
    pause() {
      stop();
      return api;
    },
    seek(to) {
      stop();
      render(resolvePosition(to, 0, 0, labels), t);
      return api;
    },
    progress(p) {
      if (p !== undefined) api.seek(clamp(p, 0, 1) * total());
      return total() ? t / total() : 0;
    },
    scrub(source, o = {}) {
      stop();
      if (prefersReducedMotion() || typeof window === 'undefined') {
        render(total(), t);
        return handle(() => {}, false);
      }
      const mode = o.source ?? 'view';
      const axis = o.axis ?? 'block';
      const needsJs = !!o.smooth || !!o.offset || cues.length > 0 || !!options.onUpdate || o.engine === 'js';
      if (!needsJs && total() > 0 && supportsNativeScrub(mode) && steps.every((st) => typeof (st.el as HTMLElement).animate === 'function')) {
        // Native: one scroll-driven animation per step, its slice of the
        // timeline mapped onto the scroll range (`cover` for a view timeline).
        const g = globalThis as any;
        const tl = mode === 'scroll' ? new g.ScrollTimeline({ source, axis }) : new g.ViewTimeline({ subject: source, axis });
        const T = total();
        steps.forEach((st) => st.anim?.cancel?.());
        built = false;
        const pct = (ms: number) => `${((ms / T) * 100).toFixed(3)}%`;
        const live = steps.map((st) => {
          const range = mode === 'view' ? { rangeStart: `cover ${pct(st.start)}`, rangeEnd: `cover ${pct(st.start + st.duration)}` } : {};
          const timing: any = { easing: st.easing, fill: 'both', timeline: tl, ...range };
          if (mode === 'scroll') Object.assign(timing, { duration: 'auto', rangeStart: pct(st.start), rangeEnd: pct(st.start + st.duration) });
          return (st.el as HTMLElement).animate(st.frames, timing);
        });
        return handle(() => {
          live.forEach((a) => a.cancel());
          render(t, t);
        }, true);
      }
      let id = 0;
      let cur = t;
      const scroller = mode === 'scroll' ? (source as HTMLElement) : null;
      const progressNow = () => {
        const x = axis === 'x' || axis === 'inline';
        if (scroller) {
          const max = x ? scroller.scrollWidth - scroller.clientWidth : scroller.scrollHeight - scroller.clientHeight;
          return clamp((x ? scroller.scrollLeft : scroller.scrollTop) / (max || 1), 0, 1);
        }
        const r = source.getBoundingClientRect();
        const vh = (x ? window.innerWidth : window.innerHeight) || 1;
        const start = x ? r.left : r.top;
        const size = x ? r.width : r.height;
        return clamp((vh + (o.offset ?? 0) - start) / (vh + size || 1), 0, 1);
      };
      const update = () => {
        id = 0;
        const goal = progressNow() * total();
        const sm = clamp(o.smooth ?? 0, 0, 0.95);
        cur = sm ? cur + (goal - cur) * (1 - sm) : goal;
        render(cur, t);
        if (sm && Math.abs(goal - cur) > 0.5) id = raf(update);
      };
      const onScroll = () => { if (!id) id = raf(update); };
      const target: EventTarget = scroller || window;
      target.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      update();
      return handle(() => {
        target.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        if (id) caf(id);
      }, false);
    },
    cancel() {
      stop();
      settle?.();
      steps.forEach((s) => s.anim?.cancel?.());
      built = false;
    },
  };
  return api;
}
