/**
 * 17.20 helpers shared by the snap and swing parts (fling-ruler, fling-dial, spring-grid, chat-head, fling-tabs,
 * swing-sign). Pure functions with no DOM access, so they are easy to test. The motion itself comes from the 17.16
 * spring core (`createSpringGroup`) and, for the hanging sign, a small pendulum stepped on the shared frame scheduler.
 * Original implementations; see docs/snap-parts-17-20.md.
 */
import { projectInertia } from '../physics/spring';

const fin = (n: unknown, d: number): number => (typeof n === 'number' && Number.isFinite(n) ? n : d);
const clamp = (n: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, n));
const r1 = (n: number): number => Math.round(n * 10) / 10;

/* ---------------------------------------------------------------- ruler */

/** The most steps a ruler draws; a finer `step` over a long range is widened to stay under it. */
export const RULER_MAX_STEPS = 2000;

/** Number of decimals a `step` needs to be shown exactly (0.25 → 2, 5 → 0). */
export function stepDecimals(step: number): number {
  const s = Math.abs(fin(step, 1));
  if (!s || s >= 1) return 0;
  const text = String(s);
  const e = /e-(\d+)$/.exec(text);
  if (e) return Math.min(10, Number(e[1]));
  return Math.min(10, (text.split('.')[1] || '').length);
}

/**
 * A ruler's range: `min` and `max` in order, a positive `step` no finer than `RULER_MAX_STEPS` steps, and how many
 * steps lie between them.
 */
export function rulerRange(min: number, max: number, step: number): { min: number; max: number; step: number; steps: number } {
  let lo = fin(min, 0);
  let hi = fin(max, 100);
  if (hi < lo) [lo, hi] = [hi, lo];
  let s = Math.abs(fin(step, 1)) || 1;
  if ((hi - lo) / s > RULER_MAX_STEPS) s = (hi - lo) / RULER_MAX_STEPS;
  const steps = Math.max(0, Math.round((hi - lo) / s));
  return { min: lo, max: lo + steps * s, step: s, steps };
}

/** The value of step `i` (clamped to the range), rounded to the step's decimals. */
export function rulerValue(i: number, min: number, step: number, steps: number): number {
  const k = clamp(Math.round(fin(i, 0)), 0, Math.max(0, Math.floor(fin(steps, 0))));
  return Number((fin(min, 0) + k * fin(step, 1)).toFixed(stepDecimals(step)));
}

/** The step nearest to `value`. */
export function rulerIndex(value: number, min: number, step: number, steps: number): number {
  const s = fin(step, 1) || 1;
  return clamp(Math.round((fin(value, fin(min, 0)) - fin(min, 0)) / s), 0, Math.max(0, Math.floor(fin(steps, 0))));
}

/**
 * The step a ruler flung at `position` (in steps, possibly past an end) with `velocity` (steps per second) comes to
 * rest on: its momentum carries it on, then it snaps to the nearest step inside the range.
 */
export function rulerRest(position: number, velocity: number, steps: number): number {
  const n = Math.max(0, Math.floor(fin(steps, 0)));
  return clamp(Math.round(projectInertia(fin(position, 0), fin(velocity, 0), 0.3)), 0, n);
}

/* ---------------------------------------------------------------- dial */

/** Split `"A, B, C"` into trimmed, non-empty option labels (2 to 36; falls back to 0 to 9). */
export function parseDialOptions(text: string | null | undefined): string[] {
  const out = String(text ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 36);
  return out.length >= 2 ? out : ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
}

/** Angle in degrees (0 = straight up, clockwise) of the point (`x`, `y`) seen from the centre (`cx`, `cy`). */
export function dialAngle(x: number, y: number, cx: number, cy: number): number {
  const a = (Math.atan2(fin(x, 0) - fin(cx, 0), -(fin(y, 0) - fin(cy, 0))) * 180) / Math.PI;
  return a < 0 ? a + 360 : a;
}

/** The shortest turn (degrees, −180 to 180) from angle `a` to angle `b`. */
export function dialDelta(a: number, b: number): number {
  let d = (fin(b, 0) - fin(a, 0)) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d === -180 ? 180 : d;
}

/**
 * The option a dial turned to `rotation` degrees points at, for `n` options spaced evenly round it. Turning the
 * dial clockwise brings the options before the current one under the pointer, as on a real dial.
 */
export function detentAt(rotation: number, n: number): number {
  const k = Math.max(1, Math.floor(fin(n, 1)));
  const i = Math.round(-fin(rotation, 0) / (360 / k));
  return ((i % k) + k) % k;
}

/** The rotation (degrees) nearest to `rotation` that puts option `index` under the pointer. */
export function detentRotation(index: number, n: number, rotation = 0): number {
  const k = Math.max(1, Math.floor(fin(n, 1)));
  const step = 360 / k;
  const base = -fin(index, 0) * step;
  const turns = Math.round((fin(rotation, 0) - base) / 360);
  return base + turns * 360;
}

/**
 * Where a dial released at `rotation` with `velocity` (degrees per second) settles: its momentum spins it on, and it
 * stops on the nearest detent.
 */
export function dialRest(rotation: number, velocity: number, n: number): number {
  const k = Math.max(1, Math.floor(fin(n, 1)));
  const step = 360 / k;
  return Math.round(projectInertia(fin(rotation, 0), clamp(fin(velocity, 0), -2400, 2400), 0.28) / step) * step;
}

/* ---------------------------------------------------------------- grid */

/** Top-left (px) of slot `i` in a grid of `cols` columns of `cell` × `rowH` px cells, `gap` px apart. */
export function gridSlot(i: number, cols: number, cell: number, gap: number, rowH = cell): { x: number; y: number } {
  const c = Math.max(1, Math.floor(fin(cols, 1)));
  const k = Math.max(0, Math.floor(fin(i, 0)));
  const g = Math.max(0, fin(gap, 0));
  return { x: r1((k % c) * (fin(cell, 0) + g)), y: r1(Math.floor(k / c) * (fin(rowH, cell) + g)) };
}

/** The slot (0 to `count` − 1) whose cell is nearest to the point (`x`, `y`), in px from the grid's top-left. */
export function slotAtPoint(x: number, y: number, cols: number, cell: number, gap: number, count: number, rowH = cell): number {
  const c = Math.max(1, Math.floor(fin(cols, 1)));
  const n = Math.max(0, Math.floor(fin(count, 0)));
  if (!n) return -1;
  const g = Math.max(0, fin(gap, 0));
  const cw = Math.max(1, fin(cell, 1) + g);
  const ch = Math.max(1, fin(rowH, cell) + g);
  const col = clamp(Math.floor((fin(x, 0) + g / 2) / cw), 0, c - 1);
  const rows = Math.ceil(n / c);
  const row = clamp(Math.floor((fin(y, 0) + g / 2) / ch), 0, rows - 1);
  return Math.min(n - 1, row * c + col);
}

/** The slot an arrow key (or Home / End) moves a picked-up item to in a grid of `cols` columns and `count` items. */
export function slotStep(index: number, key: string, cols: number, count: number): number {
  const c = Math.max(1, Math.floor(fin(cols, 1)));
  const n = Math.max(1, Math.floor(fin(count, 1)));
  const i = clamp(Math.floor(fin(index, 0)), 0, n - 1);
  const to: Record<string, number> = { ArrowLeft: i - 1, ArrowRight: i + 1, ArrowUp: i - c, ArrowDown: i + c, Home: 0, End: n - 1 };
  const t = to[key];
  return t === undefined || t < 0 || t >= n ? i : t;
}

/** The order of `n` items after the one at `from` moves to `to` (indices of the original items). */
export function gridReorder(n: number, from: number, to: number): number[] {
  const list = Array.from({ length: Math.max(0, Math.floor(fin(n, 0))) }, (_, i) => i);
  if (!list.length) return list;
  const f = clamp(Math.round(fin(from, 0)), 0, list.length - 1);
  const t = clamp(Math.round(fin(to, 0)), 0, list.length - 1);
  const [item] = list.splice(f, 1);
  list.splice(t, 0, item);
  return list;
}

/* ---------------------------------------------------------------- chat head */

export type HeadSide = 'left' | 'right';

/**
 * Where a chat head released at (`x`, `y`) (its top-left, px) with speed (`vx`, `vy`) px/s comes to rest in a
 * `fw` × `fh` frame: against the side its momentum points at, at the height it would coast to, `inset` px from the
 * edges. `size` is the head's diameter.
 */
export function headRest(x: number, y: number, vx: number, vy: number, size: number, fw: number, fh: number, inset = 10): { side: HeadSide; x: number; y: number } {
  const s = Math.max(0, fin(size, 56));
  const i = Math.max(0, fin(inset, 10));
  const w = Math.max(0, fin(fw, 0));
  const h = Math.max(0, fin(fh, 0));
  const cx = projectInertia(fin(x, 0) + s / 2, fin(vx, 0), 0.2);
  const side: HeadSide = cx < w / 2 ? 'left' : 'right';
  const top = i;
  const bottom = Math.max(i, h - s - i);
  const ty = clamp(projectInertia(fin(y, 0), clamp(fin(vy, 0), -3000, 3000), 0.12), top, bottom);
  return { side, x: side === 'left' ? i : Math.max(i, w - s - i), y: r1(ty) };
}

/**
 * How strongly a chat head at (`x`, `y`) (its centre) is drawn to a target at (`tx`, `ty`): 0 beyond `radius`,
 * rising to 1 at the target.
 */
export function magnetPull(x: number, y: number, tx: number, ty: number, radius: number): number {
  const r = Math.max(1, fin(radius, 80));
  const d = Math.hypot(fin(x, 0) - fin(tx, 0), fin(y, 0) - fin(ty, 0));
  if (d >= r) return 0;
  const f = 1 - d / r;
  return Math.round(f * f * (3 - 2 * f) * 1000) / 1000;
}

/* ---------------------------------------------------------------- tabs */

/**
 * The tab indicator at scroll position `p` (in tabs, 0 = first; fractions while a swipe is under way) for tabs at
 * `rects` (x and width, px). Between two tabs the leading edge runs ahead and the trailing edge catches up, so the
 * indicator stretches in the middle of a move and is exactly the tab's size at rest.
 */
export function indicatorAt(p: number, rects: readonly { x: number; w: number }[]): { x: number; w: number } {
  if (!rects.length) return { x: 0, w: 0 };
  const last = rects.length - 1;
  const at = fin(p, 0);
  if (at <= 0) {
    // past the first tab the indicator only squashes a little, as the panels stretch
    const f = Math.min(0.5, -at);
    return { x: r1(rects[0].x), w: r1(rects[0].w * (1 - f * 0.5)) };
  }
  if (at >= last) {
    const f = Math.min(0.5, at - last);
    const w = rects[last].w * (1 - f * 0.5);
    return { x: r1(rects[last].x + rects[last].w - w), w: r1(w) };
  }
  const i = Math.floor(at);
  const t = at - i;
  const a = rects[i];
  const b = rects[i + 1];
  // leading edge eases out, trailing edge eases in
  const lead = 1 - (1 - t) * (1 - t);
  const trail = t * t;
  const fwd = b.x >= a.x;
  const left = fwd ? a.x + (b.x - a.x) * trail : a.x + (b.x - a.x) * lead;
  const right = fwd ? a.x + a.w + (b.x + b.w - a.x - a.w) * lead : a.x + a.w + (b.x + b.w - a.x - a.w) * trail;
  return { x: r1(left), w: r1(Math.max(0, right - left)) };
}

/* ---------------------------------------------------------------- swing sign */

/**
 * One step of a damped pendulum: `angle` (radians from hanging straight down), `velocity` (rad/s), over `dt` ms, for
 * a string `length` px long under gravity, losing `damping` of its speed per second. Sub-stepped, so a long frame
 * stays stable.
 */
export function pendulumStep(angle: number, velocity: number, dt: number, length: number, damping = 1.2): { angle: number; velocity: number } {
  let a = fin(angle, 0);
  let v = fin(velocity, 0);
  const total = clamp(fin(dt, 0), 0, 100) / 1000;
  const len = Math.max(20, fin(length, 120));
  // a sign is not a point mass on a thread: a stiffer "gravity" keeps the swing lively at small sizes
  const g = 9.81 * 380;
  const k = Math.max(0, fin(damping, 1.2));
  const n = Math.max(1, Math.ceil(total / 0.004));
  const h = total / n;
  for (let i = 0; i < n; i++) {
    v += (-(g / len) * Math.sin(a) - k * v) * h;
    a += v * h;
  }
  a = clamp(a, -1.2, 1.2);
  return { angle: a, velocity: Math.abs(v) < 1e-4 && Math.abs(a) < 1e-4 ? 0 : v };
}

/** The angular speed (rad/s) a push of `vx` px/s at the bottom of a sign on a `length` px string gives it, capped. */
export function swingImpulse(vx: number, length: number): number {
  const len = Math.max(20, fin(length, 120));
  return clamp(fin(vx, 0) / len, -9, 9);
}

/** True when a pendulum has all but stopped (so its frame loop can rest). */
export function pendulumAtRest(angle: number, velocity: number): boolean {
  return Math.abs(fin(angle, 0)) < 0.0015 && Math.abs(fin(velocity, 0)) < 0.004;
}
