import { prefersReducedMotion, motionScale, onFrame } from '../base';
import { resolveSpring, linearEasing, supportsLinearEasing, SPRING_PRESETS, type SpringPreset } from './spring';

/**
 * 17.16 — the spring core of the micro-interaction system.
 *
 * - **Exact:** springs are solved in closed form (under-, critically and over-damped), so a value is the same at
 *   30, 60 or 144 Hz and never drifts or explodes on a long frame. The older `createSpring()` (v2.3, numeric steps)
 *   stays as it was.
 * - **Perceptual:** a spring can be given as `{ duration, bounce }` (response time in ms and how much it overshoots,
 *   -1…1) instead of stiffness / damping / mass; `springFromFeel()` and `springFeel()` convert both ways.
 * - **Tuned:** `MICRO_SPRINGS` holds sixteen springs for the roles of a micro-interaction (press, release, hover,
 *   toggle, drag, settle, pop, jelly …), and `MICRO_FEELS` seven feels that retune all of them at once
 *   (`crisp`, `snappy`, `smooth`, `bouncy`, `playful`, `calm`, `heavy`).
 * - **Interruptible:** `createSpringGroup()` animates several named values on one frame loop. Retargeting keeps the
 *   current velocity, `impulse()` adds velocity (a flick, a shake, a pop), and every channel can use its own spring.
 *   Under reduced motion values jump to their targets and impulses do nothing.
 */

/** A spring as response time and bounce. `duration` in ms (default 400); `bounce` from -1 (overdamped) to 1 (default 0). */
export interface SpringFeel {
  duration?: number;
  bounce?: number;
}

/** Stiffness (N/m), damping (N·s/m) and mass (kg). */
export interface SpringPhysics {
  stiffness: number;
  damping: number;
  mass: number;
}

export type MicroSpring =
  | 'instant' | 'snappy' | 'smooth' | 'gentle' | 'bouncy' | 'elastic' | 'press' | 'release'
  | 'hover' | 'toggle' | 'drag' | 'settle' | 'pop' | 'jelly' | 'heavy' | 'feather';

/** Sixteen springs tuned for the parts of a micro-interaction. */
export const MICRO_SPRINGS: Record<MicroSpring, Required<SpringFeel>> = {
  instant: { duration: 120, bounce: 0 },
  snappy: { duration: 260, bounce: 0.12 },
  smooth: { duration: 420, bounce: 0 },
  gentle: { duration: 600, bounce: 0.05 },
  bouncy: { duration: 480, bounce: 0.38 },
  elastic: { duration: 650, bounce: 0.55 },
  press: { duration: 150, bounce: 0 },
  release: { duration: 380, bounce: 0.32 },
  hover: { duration: 320, bounce: 0.15 },
  toggle: { duration: 340, bounce: 0.22 },
  drag: { duration: 110, bounce: 0 },
  settle: { duration: 520, bounce: 0.18 },
  pop: { duration: 360, bounce: 0.45 },
  jelly: { duration: 700, bounce: 0.62 },
  heavy: { duration: 800, bounce: 0.08 },
  feather: { duration: 900, bounce: 0.25 },
};

export type MicroFeel = 'crisp' | 'snappy' | 'smooth' | 'bouncy' | 'playful' | 'calm' | 'heavy';

/** A feel retunes every role spring: durations are divided by `speed` and `bounce` is added to their bounce. */
export const MICRO_FEELS: Record<MicroFeel, { speed: number; bounce: number }> = {
  crisp: { speed: 1.35, bounce: -0.1 },
  snappy: { speed: 1.2, bounce: 0 },
  smooth: { speed: 1, bounce: -0.08 },
  bouncy: { speed: 1, bounce: 0.18 },
  playful: { speed: 0.9, bounce: 0.3 },
  calm: { speed: 0.75, bounce: -0.12 },
  heavy: { speed: 0.65, bounce: 0.05 },
};

const fin = (n: unknown, d: number): number => (typeof n === 'number' && Number.isFinite(n) ? n : d);

/** `{ duration, bounce }` → stiffness / damping / mass (mass 1 unless given). */
export function springFromFeel(feel: SpringFeel = {}, mass = 1): SpringPhysics {
  const m = fin(mass, 1) > 0 ? mass : 1;
  const T = Math.min(10000, Math.max(16, fin(feel.duration, 400))) / 1000;
  const b = Math.min(0.95, Math.max(-0.95, fin(feel.bounce, 0)));
  const zeta = b >= 0 ? 1 - b : 1 / (1 + b);
  const w = (2 * Math.PI) / T;
  return { stiffness: w * w * m, damping: 2 * zeta * w * m, mass: m };
}

/** Stiffness / damping / mass → `{ duration, bounce, dampingRatio }`. */
export function springFeel(p: SpringPhysics): { duration: number; bounce: number; dampingRatio: number } {
  const k = Math.max(1e-6, p.stiffness);
  const m = Math.max(1e-6, p.mass);
  const zeta = Math.max(0, p.damping) / (2 * Math.sqrt(k * m));
  const duration = ((2 * Math.PI) / Math.sqrt(k / m)) * 1000;
  return { duration, bounce: zeta <= 1 ? 1 - zeta : 1 / zeta - 1, dampingRatio: zeta };
}

export type MicroSpringInput = MicroSpring | SpringPreset | SpringFeel | SpringPhysics | string | undefined | null;

/**
 * Any spring description → physics: a `MICRO_SPRINGS` name, a v2.3 `SPRING_PRESETS` name, `"<duration>[ms] <bounce>"`
 * (e.g. `"380ms 0.3"`), `{ duration, bounce }` or `{ stiffness, damping, mass }`. `feel` retunes it and `speed`
 * (e.g. a look's `--mo-kit-speed`) shortens or stretches it. Unknown input is the `smooth` spring.
 */
export function microSpring(input?: MicroSpringInput, feel?: MicroFeel | string | null, speed = 1): SpringPhysics {
  let f: Required<SpringFeel> | null = null;
  if (typeof input === 'string') {
    const s = input.trim();
    if (s in MICRO_SPRINGS) f = { ...MICRO_SPRINGS[s as MicroSpring] };
    else if (s in SPRING_PRESETS) f = springFeel(resolveSpring(s));
    else {
      const m = /^(\d+(?:\.\d+)?)\s*(ms|s)?(?:[\s,]+(-?\d*\.?\d+))?$/.exec(s);
      if (m) f = { duration: Number(m[1]) * (m[2] === 's' ? 1000 : 1), bounce: m[3] === undefined ? 0 : Number(m[3]) };
    }
  } else if (input && typeof input === 'object') {
    if ('stiffness' in input || 'damping' in input) {
      const r = resolveSpring(input as SpringPhysics);
      f = springFeel(r);
      if (!feel && speed === 1) return { stiffness: r.stiffness, damping: r.damping, mass: r.mass };
    } else f = { duration: fin((input as SpringFeel).duration, 400), bounce: fin((input as SpringFeel).bounce, 0) };
  }
  f ||= { ...MICRO_SPRINGS.smooth };
  const tune = feel && (MICRO_FEELS as Record<string, { speed: number; bounce: number }>)[feel];
  const sp = Math.min(4, Math.max(0.25, fin(speed, 1) > 0 ? speed : 1)) * (tune ? tune.speed : 1);
  return springFromFeel({ duration: f.duration / sp, bounce: f.bounce + (tune ? tune.bounce : 0) });
}

/**
 * The closed-form motion from `from` towards `to` starting at `velocity` (units/s). Returns a function of elapsed
 * time in ms that gives `[value, velocity]`.
 */
export function springSolution(p: SpringPhysics, from: number, to: number, velocity = 0): (ms: number) => [number, number] {
  const m = Math.max(1e-6, p.mass);
  const k = Math.max(1e-6, p.stiffness);
  const w = Math.sqrt(k / m);
  const zeta = Math.max(0, p.damping) / (2 * Math.sqrt(k * m));
  const x0 = from - to;
  const v0 = fin(velocity, 0);
  if (Math.abs(zeta - 1) < 1e-4) {
    const c = v0 + w * x0;
    return (ms) => {
      const t = Math.max(0, ms) / 1000;
      const e = Math.exp(-w * t);
      return [to + e * (x0 + c * t), e * (v0 - w * c * t)];
    };
  }
  if (zeta < 1) {
    const wd = w * Math.sqrt(1 - zeta * zeta);
    const a = zeta * w;
    const B = (v0 + a * x0) / wd;
    return (ms) => {
      const t = Math.max(0, ms) / 1000;
      const e = Math.exp(-a * t);
      const cos = Math.cos(wd * t);
      const sin = Math.sin(wd * t);
      return [to + e * (x0 * cos + B * sin), e * ((B * wd - a * x0) * cos - (a * B + x0 * wd) * sin)];
    };
  }
  const s = Math.sqrt(zeta * zeta - 1);
  const r1 = -w * (zeta - s);
  const r2 = -w * (zeta + s);
  const c2 = (v0 - r1 * x0) / (r2 - r1);
  const c1 = x0 - c2;
  return (ms) => {
    const t = Math.max(0, ms) / 1000;
    const e1 = Math.exp(r1 * t);
    const e2 = Math.exp(r2 * t);
    return [to + c1 * e1 + c2 * e2, r1 * c1 * e1 + r2 * c2 * e2];
  };
}

/** When a motion from `from` to `to` comes to rest within `precision` (a fraction of the distance; default 0.001), in ms (max 10 s). */
export function settleTime(p: SpringPhysics, from = 0, to = 1, velocity = 0, precision = 0.001): number {
  const f = springSolution(p, from, to, velocity);
  const scale = Math.max(Math.abs(to - from), Math.abs(velocity) * 0.05, 1e-6) * precision;
  let still = 0;
  for (let t = 0; t <= 10000; t += 4) {
    const [x, v] = f(t);
    if (Math.abs(x - to) < scale && Math.abs(v) < scale * 20) {
      if (!still) still = t;
      if (t - still >= 60) return still;
    } else still = 0;
  }
  return 10000;
}

/** The spring from 0 to 1 as a CSS `linear()` easing and its duration in ms, for `el.animate()` / transitions. */
export function microEasing(input?: MicroSpringInput, feel?: MicroFeel | string | null, points = 40): { easing: string; duration: number } {
  const p = microSpring(input, feel);
  const duration = settleTime(p);
  if (!supportsLinearEasing()) return { easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', duration: Math.min(duration, 1200) };
  const f = springSolution(p, 0, 1);
  const n = Math.max(2, Math.min(200, Math.round(points)));
  const values = Array.from({ length: n + 1 }, (_, i) => f((duration * i) / n)[0]);
  return { easing: linearEasing(values, n + 1), duration };
}

/* ------------------------------------------------------------------ */
/* Spring groups                                                       */
/* ------------------------------------------------------------------ */

export interface SpringGroupOptions {
  /** Default spring for every channel (default `smooth`). */
  spring?: MicroSpringInput;
  /** Feel that retunes every spring of the group. */
  feel?: MicroFeel | string | null;
  /** Speed factor (e.g. a look's `--mo-kit-speed`; default 1). */
  speed?: number;
  /** Owner element: the loop stops when it is detached. */
  owner?: Element;
  /** Called once per frame (and after `jump()`) with every value. */
  onUpdate?: (values: Record<string, number>, group: SpringGroup) => void;
  /** Called when every channel has come to rest. */
  onRest?: (values: Record<string, number>) => void;
  /** Rest precision in value units (default 0.001). */
  precision?: number;
  /** Ignore reduced motion (for values that are not motion, e.g. a colour mix). */
  always?: boolean;
}

export interface SpringGroup {
  readonly values: Record<string, number>;
  readonly animating: boolean;
  get(name: string): number;
  /** Velocity of a channel, in units per second. */
  velocity(name: string): number;
  target(name: string): number;
  /** Animate channels to new targets. `velocity` replaces their velocity; `spring` sets their spring from now on. */
  set(targets: Record<string, number>, opts?: { velocity?: Record<string, number>; spring?: MicroSpringInput }): void;
  /** Add velocity (units/s) to channels; they spring back to their targets. Optionally with a one-off spring. */
  impulse(velocities: Record<string, number>, spring?: MicroSpringInput): void;
  /** Move channels at once, with no motion. */
  jump(values: Record<string, number>): void;
  /** Change the default spring, feel or speed (running channels keep theirs until set again). */
  configure(opts: { spring?: MicroSpringInput; feel?: MicroFeel | string | null; speed?: number }): void;
  /** Stop every channel where it is. */
  stop(): void;
}

interface Channel {
  x: number;
  v: number;
  to: number;
  t0: number;
  p: SpringPhysics;
  f: ((ms: number) => [number, number]) | null;
}

/**
 * Several spring-animated numbers that share one frame loop (on the motion clock, so `setClock()` slows or pauses
 * them too). Retargeting keeps velocity; each channel keeps the spring it was last set with.
 */
export function createSpringGroup(initial: Record<string, number>, opts: SpringGroupOptions = {}): SpringGroup {
  let spec: MicroSpringInput = opts.spring;
  let feel = opts.feel;
  let speed = opts.speed ?? 1;
  let base = microSpring(spec, feel, speed);
  const ch = new Map<string, Channel>();
  const values: Record<string, number> = {};
  let clock = 0;
  let stopLoop: (() => void) | null = null;
  const precision = opts.precision ?? 0.001;
  const reduced = () => !opts.always && prefersReducedMotion();
  const add = (name: string, value: number): Channel => {
    const c: Channel = { x: value, v: 0, to: value, t0: 0, p: base, f: null };
    ch.set(name, c);
    values[name] = value;
    return c;
  };
  for (const [k, v] of Object.entries(initial)) add(k, fin(v, 0));
  const chan = (name: string) => ch.get(name) || add(name, 0);
  const sample = (c: Channel) => {
    if (!c.f) return;
    [c.x, c.v] = c.f(clock - c.t0);
  };
  const tuned = (s: MicroSpringInput) => (s === undefined ? base : microSpring(s, feel, speed));
  const restart = (c: Channel) => {
    c.t0 = clock;
    c.f = springSolution(c.p, c.x, c.to, c.v);
  };
  let fresh = false;
  const frame = (_t: number, dt: number) => {
    // the scheduler's first delta after a quiet spell spans the whole quiet time: count one frame instead
    clock += Math.min(fresh ? 16.7 : 64, Math.max(0, dt)) / Math.max(0.01, motionScale());
    fresh = false;
    let busy = false;
    ch.forEach((c, name) => {
      if (c.f) {
        sample(c);
        const scale = Math.max(1, Math.abs(c.to)) * precision;
        if (Math.abs(c.x - c.to) < scale && Math.abs(c.v) < scale * 30) {
          c.x = c.to;
          c.v = 0;
          c.f = null;
        } else busy = true;
      }
      values[name] = c.x;
    });
    opts.onUpdate?.(values, group);
    if (!busy) {
      stopLoop?.();
      stopLoop = null;
      opts.onRest?.(values);
    }
  };
  const wake = () => {
    if (stopLoop) return;
    fresh = true;
    stopLoop = onFrame(frame, opts.owner);
  };
  const group: SpringGroup = {
    values,
    get animating() {
      return !!stopLoop;
    },
    get: (name) => chan(name).x,
    velocity: (name) => chan(name).v,
    target: (name) => chan(name).to,
    set(targets, o = {}) {
      const p = o.spring === undefined ? undefined : tuned(o.spring);
      if (reduced()) return group.jump(targets);
      for (const [name, to] of Object.entries(targets)) {
        if (!Number.isFinite(to)) continue;
        const c = chan(name);
        sample(c);
        c.to = to;
        if (p) c.p = p;
        const v = o.velocity?.[name];
        if (v !== undefined && Number.isFinite(v)) c.v = v;
        restart(c);
      }
      wake();
    },
    impulse(vel, s) {
      if (reduced()) return;
      const p = s === undefined ? undefined : tuned(s);
      for (const [name, dv] of Object.entries(vel)) {
        if (!Number.isFinite(dv) || !dv) continue;
        const c = chan(name);
        sample(c);
        c.v += dv;
        if (p) c.p = p;
        restart(c);
      }
      wake();
    },
    jump(vals) {
      for (const [name, x] of Object.entries(vals)) {
        if (!Number.isFinite(x)) continue;
        const c = chan(name);
        c.x = c.to = x;
        c.v = 0;
        c.f = null;
        values[name] = x;
      }
      if (![...ch.values()].some((c) => c.f)) {
        stopLoop?.();
        stopLoop = null;
      }
      opts.onUpdate?.(values, group);
    },
    configure(o) {
      if ('spring' in o) spec = o.spring;
      if ('feel' in o) feel = o.feel;
      if (o.speed !== undefined) speed = o.speed;
      base = microSpring(spec, feel, speed);
    },
    stop() {
      ch.forEach((c) => {
        sample(c);
        c.to = c.x;
        c.v = 0;
        c.f = null;
      });
      stopLoop?.();
      stopLoop = null;
    },
  };
  return group;
}
