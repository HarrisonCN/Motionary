/**
 * `motionary/motion` (= `motionary/components/motion`, 14.0) — **Motion Engine v2**: one composable
 * animation API with one controller interface.
 *
 * ```ts
 * import { animate, sequence, parallel, stagger, spring, timeline } from 'motionary/motion';
 * import { playScene } from 'motionary/motion/scene'; // scene v2 → one controller (own entry)
 *
 * const intro = sequence([
 *   animate('.title', 'fade-up', { duration: '{duration.slow}' }),
 *   parallel([
 *     stagger('.card', [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'none' }], { each: 60 }),
 *     spring('.cta', [{ transform: 'scale(0)' }, { transform: 'none' }], 'bouncy'),
 *   ]),
 * ]);
 * intro.pause(); intro.seek(400); intro.reverse(); await intro.finished;
 * ```
 *
 * Every function returns {@link MotionControls}: `play()`, `pause()`, `seek(ms)`, `reverse()`,
 * `finish()`, `cancel()`, `finished`, `currentTime`, `progress`, `duration`, `playbackRate`,
 * `playState`. A controller passed into `sequence` / `parallel` / `stagger` / `timeline` is adopted:
 * the composition drives it from then on. Built on the shared frame scheduler and motion clock
 * (13.4 / 8.0) and the timeline runtime (3.1 position grammar `'>' '<' '+=n' '-=n' 'label+=n'`,
 * named presets, motion tokens). DOM targets run as paused WAAPI animations (`fill: forwards`);
 * without WAAPI they jump to the frame at the playhead. Reduced motion: playing jumps to the end.
 * Not part of `motionary/components/lite`; zero dependencies.
 */
import { applyFrame } from '../base';
import { resolvePosition, TIMELINE_PRESETS } from '../timeline/core';
import { resolveDurationToken, resolveEasingToken, motionToken } from '../tokens/index';
import { springSamples, resolveSpring, linearEasing, supportsLinearEasing } from '../physics/spring';
import type { SpringInput } from '../physics/spring';
import { control, group, loop } from './controls';
import type { Ctl, MotionControls, MotionNode, ControlOptions } from './controls';

export type { MotionControls, MotionPlayState, ControlOptions } from './controls';
export type { SpringInput } from '../physics/spring';

/** Engine generation (14.0 = 2). */
export const MOTION_ENGINE_VERSION = 2;

export type EasingInput = string | ((p: number) => number);
export interface MotionOptions extends ControlOptions {
  /** ms, or a duration token (`'{duration.fast}'`, `'fast'`). Default 300. */
  duration?: number | string;
  delay?: number;
  endDelay?: number;
  /** CSS easing, `'{easing.standard}'` token, or a function of 0–1. Default `ease` for elements, `linear` for objects and callbacks. */
  easing?: EasingInput;
  /** Extra passes (`Infinity` = forever; such a motion cannot be composed). */
  repeat?: number;
  /** Every other pass runs backwards. */
  alternate?: boolean;
}
export type MotionTarget = string | Element | ArrayLike<Element> | Record<string, any> | ((progress: number) => void);
export type MotionKeyframes = Keyframe[] | PropertyIndexedKeyframes | string | Record<string, number | number[]>;

/** `'{duration.fast}'` / `'{easing.standard}'` → the token name. */
const ref = <T,>(v: T): T => (typeof v === 'string' ? (v.replace(/^\{(?:duration|easing)\.([\w-]+)\}$/, '$1') as any) : v);
const easeCss = (e?: string) => resolveEasingToken(ref(e), 'ease');

// --- easing ---------------------------------------------------------------------------

/** A CSS `cubic-bezier()` as a function of 0–1. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (p: number) => number {
  const f = (a: number, b: number, t: number) => ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
  return (x) => {
    if (x <= 0 || x >= 1) return x <= 0 ? 0 : 1;
    // bisection on x(t): 24 halvings ≈ 6e-8 precision
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 24; i++) f(x1, x2, t) < x ? (lo = t) : (hi = t), (t = (lo + hi) / 2);
    return f(y1, y2, t);
  };
}
const KW: Record<string, string> = { ease: '.25,.1,.25,1', 'ease-in': '.42,0,1,1', 'ease-out': '0,0,.58,1', 'ease-in-out': '.42,0,.58,1' };

/** A CSS easing string (keyword, `cubic-bezier()`, `steps()`, `linear(…)`, token) or function → function of 0–1. */
export function toEasingFn(e?: EasingInput): (p: number) => number {
  if (typeof e === 'function') return e;
  let s = easeCss(e).trim();
  if (KW[s]) s = `cubic-bezier(${KW[s]})`;
  const n = (/\(([^)]*)\)/.exec(s)?.[1] || '').split(',').map((x) => parseFloat(x));
  if (s.startsWith('cubic-bezier') && n.length === 4) return cubicBezier(n[0], n[1], n[2], n[3]);
  if (s.startsWith('steps') && n[0] > 0) return (p) => Math.min(1, Math.floor(p * n[0]) / n[0]);
  if (s.startsWith('linear(') && n.length > 1) return pts(n);
  return (p) => p;
}
/** Evenly spaced samples → piecewise-linear easing. */
const pts = (v: number[]) => (p: number): number => {
  const x = Math.min(1, Math.max(0, p)) * (v.length - 1);
  const i = Math.min(v.length - 2, Math.floor(x));
  return v[i] + (v[i + 1] - v[i]) * (x - i);
};

// --- leaves ---------------------------------------------------------------------------

const els = (t: any): Element[] =>
  typeof t === 'string' ? (typeof document === 'undefined' ? [] : Array.from(document.querySelectorAll(t))) : typeof Element !== 'undefined' && t instanceof Element ? [t] : Array.from(t as ArrayLike<Element>);
const isEls = (t: any) => typeof t === 'string' || (typeof Element !== 'undefined' && t instanceof Element) || (t && typeof t.length === 'number' && typeof t !== 'function');

function frames(k: MotionKeyframes): Keyframe[] {
  if (typeof k === 'string') return TIMELINE_PRESETS[k] || TIMELINE_PRESETS.fade;
  if (Array.isArray(k)) return k;
  const keys = Object.keys(k);
  const n = Math.max(1, ...keys.map((p) => (Array.isArray((k as any)[p]) ? (k as any)[p].length : 1)));
  return Array.from({ length: n }, (_, i) => Object.fromEntries(keys.map((p) => { const v = (k as any)[p]; return [p, Array.isArray(v) ? v[Math.min(i, v.length - 1)] : v]; })));
}

/** One leaf: delay + duration + endDelay of `draw(p, localMs)`. */
function leaf(o: MotionOptions, draw: (t: number, dur: number) => void, x?: () => void): MotionNode {
  const dur = Math.max(0, resolveDurationToken(ref(o.duration), 300));
  const delay = o.delay || 0;
  const n: MotionNode = { d: delay + dur + (o.endDelay || 0), r: (t) => draw(t - delay, dur), x };
  return loop(n, o.repeat, o.alternate);
}

function node(target: MotionTarget, keyframes: MotionKeyframes | undefined, o: MotionOptions, waapiEasing?: string): MotionNode {
  const ease = toEasingFn(o.easing || (isEls(target) ? 'ease' : 'linear'));
  if (typeof target === 'function') {
    let last: number | undefined;
    return leaf(o, (t, d) => {
      if (t < 0 && (last === undefined || last === 0)) return;
      const p = ease(d ? Math.min(1, Math.max(0, t / d)) : 1);
      if (p !== last) target((last = p));
    });
  }
  if (isEls(target)) {
    const kf = frames(keyframes || 'fade');
    const list = els(target);
    const anims = new Map<Element, Animation | null>();
    const easing = waapiEasing || (typeof o.easing === 'function' ? 'linear' : easeCss(o.easing));
    const fn = !waapiEasing && typeof o.easing === 'function' ? ease : null;
    return leaf(
      o,
      (t, d) => {
        for (const el of list) {
          let a = anims.get(el);
          if (a === undefined) {
            a = typeof (el as any).animate === 'function' ? (el as any).animate(kf, { duration: d || 0.001, easing, fill: 'forwards' }) : null;
            a?.pause();
            anims.set(el, a!);
          }
          const lt = fn && t >= 0 ? fn(Math.min(1, t / (d || 1))) * d : t;
          if (a) a.currentTime = Math.min(lt, d);
          else if (t >= 0) applyFrame(el as HTMLElement, kf[Math.round((d ? Math.min(1, t / d) : 1) * (kf.length - 1))]);
        }
      },
      () => {
        anims.forEach((a) => a?.cancel());
        anims.clear();
      }
    );
  }
  // plain object: tween numeric props from their current values
  const to = (keyframes || {}) as Record<string, number | number[]>;
  let from: Record<string, number> | null = null;
  return leaf(o, (t, d) => {
    if (t < 0 && !from) return;
    from ||= Object.fromEntries(Object.keys(to).map((k) => [k, Array.isArray(to[k]) ? (to[k] as number[])[0] : Number((target as any)[k]) || 0]));
    const p = ease(d ? Math.min(1, Math.max(0, t / d)) : 1);
    for (const k of Object.keys(to)) {
      const v = to[k];
      const end = Array.isArray(v) ? v[v.length - 1] : v;
      (target as any)[k] = from[k] + (end - from[k]) * p;
    }
  });
}

/**
 * Animate a target: elements (selector / Element / list; keyframes, a preset name such as `'fade-up'`, or
 * property-indexed keyframes), a plain object (numeric props) or a callback `(progress) => void`.
 */
export function animate(target: (progress: number) => void, options?: MotionOptions): MotionControls;
export function animate(target: MotionTarget, keyframes: MotionKeyframes, options?: MotionOptions): MotionControls;
export function animate(target: MotionTarget, a?: any, b?: MotionOptions): MotionControls {
  const fn = typeof target === 'function';
  const o: MotionOptions = (fn ? a : b) || {};
  return control(node(target, fn ? undefined : a, o), o);
}

/** Run children one after another (`gap` ms between them; negative overlaps). */
export function sequence(children: MotionControls[], options: SequenceOptions = {}): MotionControls {
  let at = 0;
  return group(
    (children as Ctl[]).map((c, i) => {
      const s = at + (i ? options.gap || 0 : 0);
      at = s + c._n.d;
      return [c, s] as [Ctl, number];
    }),
    options
  );
}
export interface SequenceOptions extends ControlOptions { gap?: number; repeat?: number; alternate?: boolean }

/** Run children together; the duration is the longest child's. */
export function parallel(children: MotionControls[], options: SequenceOptions = {}): MotionControls {
  return group((children as Ctl[]).map((c) => [c, 0] as [Ctl, number]), options);
}

export interface StaggerOptions extends MotionOptions {
  /** ms between consecutive starts (default 50). */
  each?: number;
  /** Where the wave starts: `'first'` (default), `'last'`, `'center'` or an index. */
  from?: 'first' | 'last' | 'center' | number;
}
const offsets = (n: number, o: StaggerOptions) => {
  const c = o.from === 'last' ? n - 1 : o.from === 'center' ? (n - 1) / 2 : typeof o.from === 'number' ? o.from : 0;
  return Array.from({ length: n }, (_, i) => Math.abs(i - c) * (o.each ?? 50));
};

/** One animation per element, each starting `each` ms after the previous — or offset existing controllers. */
export function stagger(targets: MotionControls[], options?: StaggerOptions): MotionControls;
export function stagger(targets: string | ArrayLike<Element>, keyframes: MotionKeyframes, options?: StaggerOptions): MotionControls;
export function stagger(targets: any, a?: any, b?: StaggerOptions): MotionControls {
  if (Array.isArray(targets) && targets.length && (targets[0] as Ctl)._n) {
    const o: StaggerOptions = a || {};
    const off = offsets(targets.length, o);
    return group(targets.map((c: Ctl, i: number) => [c, off[i]] as [Ctl, number]), o);
  }
  const o: StaggerOptions = b || {};
  const list = els(targets);
  const off = offsets(list.length, o);
  // repeat / alternate and the control options belong to the group; each leaf gets one pass
  const leafO = { ...o, repeat: 0, alternate: false };
  return group(list.map((el, i) => [control(node(el, a, leafO), { autoplay: false }), off[i]] as [Ctl, number]), o);
}

/**
 * Animate with spring physics: duration and easing come from the spring (`'bouncy'`, a preset name,
 * `{ stiffness, damping, mass, velocity }`, or a motion token `'{spring.snappy}'`). Overshoots.
 */
export function spring(target: (progress: number) => void, spring?: SpringInput, options?: ControlOptions & { delay?: number }): MotionControls;
export function spring(target: MotionTarget, keyframes: MotionKeyframes, spring?: SpringInput, options?: ControlOptions & { delay?: number }): MotionControls;
export function spring(target: MotionTarget, a?: any, b?: any, c?: any): MotionControls {
  const fn = typeof target === 'function';
  const input: SpringInput = fn ? a : b;
  const o = (fn ? b : c) || {};
  const tok = typeof input === 'string' && /^\{spring\.(.+)\}$/.exec(input);
  const st = tok && motionToken('spring', tok[1]); // 14.1: the active token set (applyMotionTokens / applyMotionTokenSet), then the defaults
  const cfg = tok ? (st && resolveSpring(st)) || undefined : input;
  const { values, duration } = springSamples(cfg);
  const css = supportsLinearEasing() ? linearEasing(values) : 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  const opts: MotionOptions = { ...o, duration, easing: pts(values) };
  return control(node(target, fn ? undefined : a, opts, css), opts);
}
export interface TimelineBuilder extends MotionControls {
  /** Add a child at a position (ms, `'>'`, `'<'`, `'+=n'`, `'-=n'`, `'label'`, `'label+=n'`; default `'>'` = after the last). */
  add(child: MotionControls, position?: number | string): TimelineBuilder;
  /** Name the current end (or a position) for later `add()` calls. */
  label(name: string, position?: number | string): TimelineBuilder;
}

/**
 * Place children on one playhead with the timeline position grammar; returns controls that keep
 * accepting `add()` / `label()`. Also accepts `[[child, position], …]` up front.
 */
export function timeline(entries?: [MotionControls, (number | string)?][] | MotionOptions, options: SequenceOptions = {}): TimelineBuilder {
  if (entries && !Array.isArray(entries)) (options = entries), (entries = []);
  const items: [Ctl, number][] = [];
  const labels: Record<string, number> = {};
  let end = 0;
  let prev = 0;
  let ctl: Ctl = group([], { ...options, autoplay: false });
  let queued = options.autoplay !== false;
  const rebuild = () => {
    const was = ctl;
    ctl = group(items, { ...options, autoplay: false });
    if (was.currentTime) ctl.seek(was.currentTime);
    if (queued) {
      queued = false;
      queueMicrotask(() => ctl.playState === 'idle' && ctl.play());
    }
  };
  const add = (child: MotionControls, pos?: number | string) => {
    const at = resolvePosition(pos, end, prev, labels);
    items.push([child as Ctl, (prev = at)]);
    end = Math.max(end, at + (child as Ctl)._n.d);
    rebuild();
    return tl;
  };
  const label = (name: string, pos?: number | string) => ((labels[name] = resolvePosition(pos, end, prev, labels)), tl);
  // the builder forwards to the current composition; chainable methods return the builder
  const tl: TimelineBuilder = new Proxy({} as any, {
    get: (_, k) => {
      if (k === 'add') return add;
      if (k === 'label') return label;
      const v = (ctl as any)[k];
      return typeof v === 'function' && k !== '_a' ? (...args: any[]) => { const r = v.apply(ctl, args); return r === ctl ? tl : r; } : v;
    },
    set: (_, k, v) => (((ctl as any)[k] = v), true),
  });
  for (const [c, p] of entries || []) tl.add(c, p);
  if (!(entries as any[])?.length && queued) rebuild();
  return tl;
}
