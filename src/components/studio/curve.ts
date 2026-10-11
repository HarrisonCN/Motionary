/**
 * 14.4 Motion Studio: easing curves for the curve editor — cubic-bezier control points, presets and spring
 * parameters. Pure (no DOM). The timeline model stores an easing string per keyframe (`cubic-bezier(…)` / a named
 * ease), so a spring is fitted to the closest cubic-bezier; the spring parameters themselves are kept in the Studio
 * project file (`studio.springs`) so the editor can reopen them.
 */
import { cubicBezier } from '../../runtime/ease';

/** `[x1, y1, x2, y2]` — the two control points of a CSS `cubic-bezier()`. */
export type Bezier = [number, number, number, number];
export interface SpringParams { stiffness: number; damping: number; mass: number }

/** Curve editor presets (the CSS keywords plus a few common shapes). */
export const CURVE_PRESETS: Record<string, Bezier> = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  smooth: [0.22, 1, 0.36, 1],
  snappy: [0.2, 0, 0, 1],
  anticipate: [0.36, 0, 0.66, -0.56],
  overshoot: [0.34, 1.56, 0.64, 1],
};

const r3 = (n: number) => Math.round(n * 1000) / 1000 + 0;
const NUM = '\\s*(-?(?:\\d+\\.?\\d*|\\.\\d+))\\s*';
const CB = /*#__PURE__*/ new RegExp(`^cubic-bezier\\(${NUM},${NUM},${NUM},${NUM}\\)$`);

/** The control points of an easing: a preset / CSS keyword or `cubic-bezier(…)` (`undefined` = linear). `null` for anything else (`steps()`, named eases like `bounce-out`). */
export function parseBezier(easing: string | undefined): Bezier | null {
  const s = (easing ?? 'linear').trim();
  const p = CURVE_PRESETS[s];
  if (p) return [...p] as Bezier;
  const m = CB.exec(s);
  return m ? [+m[1], +m[2], +m[3], +m[4]] : null;
}

/** The easing string for control points: `linear`, else `cubic-bezier(x1, y1, x2, y2)` (x clamped to 0…1, 3 decimals). */
export function bezierEasing(b: Bezier): string {
  const c = (v: number, x: boolean) => r3(x ? Math.min(1, Math.max(0, v)) : Math.min(5, Math.max(-5, v)));
  const v = [c(b[0], true), c(b[1], false), c(b[2], true), c(b[3], false)];
  return v.join() === '0,0,1,1' ? 'linear' : `cubic-bezier(${v.join(', ')})`;
}

const pos = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : d);
/** Spring parameters with defaults (stiffness 170, damping 26, mass 1) for anything missing or invalid. */
export const springParams = (s: Partial<SpringParams> = {}): SpringParams => ({
  stiffness: pos(s.stiffness, 170),
  damping: typeof s.damping === 'number' && Number.isFinite(s.damping) && s.damping >= 0 ? s.damping : 26,
  mass: pos(s.mass, 1),
});

const fitCache = /*#__PURE__*/ new Map<string, { easing: string; bezier: Bezier; duration: number }>();
/**
 * The cubic-bezier closest to a spring (unit step, from rest), and the time the spring takes to settle (ms). A cubic
 * curve can overshoot once, so an underdamped spring keeps its first overshoot and loses later wobbles.
 * Deterministic: a fixed-step simulation and a fixed search grid.
 */
export function springBezier(input: Partial<SpringParams>): { easing: string; bezier: Bezier; duration: number } {
  const { stiffness: k, damping: c, mass: m } = springParams(input);
  const key = `${k}|${c}|${m}`;
  const hit = fitCache.get(key);
  if (hit) return hit;
  // simulate at 1 ms until settled (max 10 s)
  const xs: number[] = [0];
  let x = 0, v = 0, t = 0;
  while (t < 10000) {
    v += ((-k * (x - 1) - c * v) / m) * 0.001;
    x += v * 0.001;
    xs.push(x);
    t++;
    if (Math.abs(1 - x) < 0.001 && Math.abs(v) < 0.01) break;
  }
  const N = 24;
  const target = Array.from({ length: N + 1 }, (_, i) => xs[Math.round((i / N) * t)]);
  target[N] = 1;
  const over = xs.some((v) => v > 1.001); // a spring that never overshoots gets a curve that never does
  let best: Bezier = [0, 0, 1, 1], err = Infinity;
  for (const x1 of [0.1, 0.2, 0.3, 0.4]) for (const x2 of [0.2, 0.4, 0.6, 0.8]) {
    for (let a = 0; a <= 30; a++) for (let b = 0; b <= 24; b++) {
      const y1 = a / 10, y2 = 0.6 + b * 0.05;
      if (!over && (y1 > 1 || y2 > 1.0001)) continue;
      const f = cubicBezier(x1, y1, x2, y2);
      let e = 0;
      for (let i = 1; i < N && e < err; i++) e += (f(i / N) - target[i]) ** 2;
      if (e < err) { err = e; best = [x1, y1, x2, r3(y2)]; }
    }
  }
  const out = { easing: bezierEasing(best), bezier: best, duration: t };
  if (fitCache.size > 64) fitCache.clear();
  fitCache.set(key, out);
  return out;
}
