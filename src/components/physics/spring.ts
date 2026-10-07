import { prefersReducedMotion, motionScale, raf, caf, now, applyFrame, EASE_SPRING } from '../base';

/**
 * Spring physics core (v2.3). A damped harmonic oscillator integrated in
 * 1 ms steps: `stiffness` (k, N/m), `damping` (c) and `mass` (m). Used by
 * the `<usa-spring>`, `<usa-draggable>` and `<usa-overscroll>` elements and
 * exported for your own animations:
 *
 * - `springEasing()` turns a spring into a CSS `linear()` easing + duration
 *   for WAAPI / CSS (falls back to a cubic-bezier overshoot where `linear()`
 *   is unsupported);
 * - `spring(el, keyframes, cfg)` animates with it;
 * - `createSpring()` is an interruptible, velocity-preserving value for
 *   gestures (drag, inertia, snap).
 */
export interface SpringConfig {
  /** Spring stiffness (default 170). Higher = faster, snappier. */
  stiffness?: number;
  /** Damping / friction (default 26). Lower = more bounces. */
  damping?: number;
  /** Mass (default 1). Higher = slower, heavier. */
  mass?: number;
  /** Initial velocity in progress units per second (default 0). */
  velocity?: number;
  /** Rest threshold (default 0.001). */
  precision?: number;
}

export type SpringPreset = 'default' | 'gentle' | 'wobbly' | 'stiff' | 'bouncy' | 'slow' | 'molasses';

export const SPRING_PRESETS: Record<SpringPreset, Required<Pick<SpringConfig, 'stiffness' | 'damping' | 'mass'>>> = {
  default: { stiffness: 170, damping: 26, mass: 1 },
  gentle: { stiffness: 120, damping: 14, mass: 1 },
  wobbly: { stiffness: 180, damping: 12, mass: 1 },
  stiff: { stiffness: 210, damping: 20, mass: 1 },
  bouncy: { stiffness: 300, damping: 10, mass: 1 },
  slow: { stiffness: 280, damping: 60, mass: 1 },
  molasses: { stiffness: 280, damping: 120, mass: 1 },
};

export type SpringInput = SpringPreset | SpringConfig | string | undefined;

/** Resolve a preset name or a partial config to a full config. */
export function resolveSpring(input?: SpringInput): Required<SpringConfig> {
  const base = typeof input === 'string' ? SPRING_PRESETS[input as SpringPreset] || SPRING_PRESETS.default : { ...SPRING_PRESETS.default, ...(input || {}) };
  const pos = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : d);
  const o = (typeof input === 'object' && input) || {};
  return {
    stiffness: pos(base.stiffness, 170),
    damping: Math.max(0, Number.isFinite(base.damping) ? base.damping : 26),
    mass: pos(base.mass, 1),
    velocity: Number.isFinite(o.velocity) ? (o.velocity as number) : 0,
    precision: pos(o.precision, 0.001),
  };
}

/** One integration step (semi-implicit Euler) towards `to`. Returns [x, v]. */
export function stepSpring(cfg: Required<SpringConfig>, x: number, v: number, to: number, dt: number): [number, number] {
  const a = (-cfg.stiffness * (x - to) - cfg.damping * v) / cfg.mass;
  const nv = v + a * dt;
  return [x + nv * dt, nv];
}

const cache = new Map<string, { values: number[]; duration: number }>();

/**
 * Sample the spring from 0 to 1 at `fps` (default 60). `values` may exceed 1
 * (overshoot); `duration` is the time to rest, in ms (max 10 s).
 */
export function springSamples(input?: SpringInput, fps = 60): { values: number[]; duration: number } {
  const cfg = resolveSpring(input);
  const key = `${cfg.stiffness}|${cfg.damping}|${cfg.mass}|${cfg.velocity}|${cfg.precision}|${fps}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const values = [0];
  let x = 0;
  let v = cfg.velocity;
  const frame = 1000 / fps;
  let t = 0;
  let next = frame;
  while (t < 10000) {
    [x, v] = stepSpring(cfg, x, v, 1, 0.001);
    t += 1;
    if (t >= next) {
      values.push(x);
      next += frame;
      if (Math.abs(1 - x) < cfg.precision && Math.abs(v) < cfg.precision * 10) break;
    }
  }
  values[values.length - 1] = 1;
  const out = { values, duration: Math.round(t) };
  if (cache.size > 64) cache.clear();
  cache.set(key, out);
  return out;
}

/** `true` when CSS `linear()` easing is supported. */
export function supportsLinearEasing(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timing-function', 'linear(0, 1)');
}

/**
 * The spring as `{ easing, duration }` for `el.animate()` / CSS. `easing` is
 * a `linear(…)` function with at most `points` stops (default 48), or a
 * cubic-bezier overshoot where `linear()` is unsupported.
 */
export function springEasing(input?: SpringInput, points = 48): { easing: string; duration: number } {
  const { values, duration } = springSamples(input);
  if (!supportsLinearEasing()) return { easing: EASE_SPRING, duration: Math.min(duration, 1200) };
  return { easing: linearEasing(values, points), duration };
}

/** Build a CSS `linear()` easing from samples (down-sampled to `points`). */
export function linearEasing(values: number[], points = 48): string {
  const n = values.length;
  const step = Math.max(1, Math.ceil((n - 1) / Math.max(2, points - 1)));
  const out: string[] = [];
  for (let i = 0; i < n - 1; i += step) out.push(String(Math.round(values[i] * 1000) / 1000));
  out.push('1');
  return `linear(${out.join(', ')})`;
}

/**
 * Animate `el` between keyframes with spring timing (WAAPI). Under reduced
 * motion the final frame is applied immediately. Returns the Animation (or
 * `null` without WAAPI / under reduced motion).
 */
export function spring(el: Element, keyframes: Keyframe[], input?: SpringInput, options: KeyframeAnimationOptions = {}): Animation | null {
  const target = el as HTMLElement;
  if (prefersReducedMotion() || typeof target.animate !== 'function') {
    applyFrame(target, keyframes[keyframes.length - 1]);
    return null;
  }
  const { easing, duration } = springEasing(input);
  return target.animate(keyframes, { duration: duration * motionScale(), easing, fill: 'both', ...options });
}

/* ------------------------------------------------------------------ */
/* Interactive springs                                                 */
/* ------------------------------------------------------------------ */

export interface SpringValueOptions {
  /** Start value (default 0). */
  value?: number;
  /** Spring config or preset (default `'default'`). */
  spring?: SpringInput;
  /** Called with the value every frame (and on `jump()`). */
  onUpdate?: (value: number, velocity: number) => void;
  /** Called when the value comes to rest at its target. */
  onRest?: (value: number) => void;
}

export interface SpringValue {
  readonly value: number;
  /** Units per second. */
  readonly velocity: number;
  readonly target: number;
  readonly animating: boolean;
  /** Animate to `target`, optionally with a new initial velocity (units/s). */
  set(target: number, velocity?: number): void;
  /** Jump to `value` with no animation. */
  jump(value: number): void;
  /** Stop where it is. */
  stop(): void;
  /** Change the spring config. */
  configure(spring: SpringInput): void;
}

/**
 * An interruptible spring-animated number: call `set()` as often as you like,
 * the motion keeps its velocity (like iOS / Framer springs). Reduced motion
 * jumps straight to the target.
 */
export function createSpring(opts: SpringValueOptions = {}): SpringValue {
  let cfg = resolveSpring(opts.spring);
  let x = opts.value ?? 0;
  let v = 0;
  let to = x;
  let id = 0;
  let last = 0;
  let running = false;
  const stop = () => {
    if (running) caf(id);
    running = false;
  };
  const loop = () => {
    const t = now();
    let dt = Math.min(64, Math.max(1, t - last));
    last = t;
    while (dt > 0) {
      const s = Math.min(dt, 4);
      [x, v] = stepSpring(cfg, x, v, to, s / 1000);
      dt -= s;
    }
    const scale = Math.max(1, Math.abs(to) * 0.0005);
    if (Math.abs(to - x) < cfg.precision * scale * 10 && Math.abs(v) < cfg.precision * scale * 100) {
      x = to;
      v = 0;
      running = false;
      opts.onUpdate?.(x, 0);
      opts.onRest?.(x);
      return;
    }
    opts.onUpdate?.(x, v);
    id = raf(loop);
  };
  const api: SpringValue = {
    get value() {
      return x;
    },
    get velocity() {
      return v;
    },
    get target() {
      return to;
    },
    get animating() {
      return running;
    },
    set(target, velocity) {
      to = target;
      if (velocity !== undefined && Number.isFinite(velocity)) v = velocity;
      if (prefersReducedMotion()) {
        api.jump(target);
        opts.onRest?.(target);
        return;
      }
      if (!running) {
        running = true;
        last = now();
        id = raf(loop);
      }
    },
    jump(value) {
      stop();
      x = to = value;
      v = 0;
      opts.onUpdate?.(x, 0);
    },
    stop() {
      stop();
      v = 0;
      to = x;
    },
    configure(input) {
      cfg = resolveSpring(input);
    },
  };
  return api;
}

/* ------------------------------------------------------------------ */
/* Inertia + snapping                                                  */
/* ------------------------------------------------------------------ */

/**
 * Where a flick at `velocity` (units/s) comes to rest with exponential
 * decay: `value + velocity · timeConstant` (default 0.325 s, iOS-like).
 */
export function projectInertia(value: number, velocity: number, timeConstant = 0.325): number {
  return value + velocity * timeConstant;
}

/** Snap to a grid (`number`) or the nearest of a list of points. */
export function snapTo(value: number, to: number | number[] | null | undefined): number {
  if (Array.isArray(to)) {
    if (!to.length) return value;
    return to.reduce((best, p) => (Math.abs(p - value) < Math.abs(best - value) ? p : best), to[0]);
  }
  if (typeof to === 'number' && to > 0) return Math.round(value / to) * to;
  return value;
}

/** iOS-style rubber-band resistance: how far content moves when pulled `distance` past an edge. */
export function rubberBand(distance: number, dimension: number, constant = 0.55): number {
  if (dimension <= 0) return 0;
  const sign = distance < 0 ? -1 : 1;
  const d = Math.abs(distance);
  return sign * (1 - 1 / ((d * constant) / dimension + 1)) * dimension;
}
