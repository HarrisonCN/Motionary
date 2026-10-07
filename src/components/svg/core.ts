import { prefersReducedMotion, motionScale, raf, caf, now, clamp } from '../base';

const NUM = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;

/** `true` when two path strings share the same commands (so their numbers can be interpolated). */
export function pathsCompatible(a: string, b: string): boolean {
  return a.replace(NUM, '#').replace(/[\s,]+/g, ' ').trim() === b.replace(NUM, '#').replace(/[\s,]+/g, ' ').trim();
}

/**
 * Path data between `a` and `b` at `t` (0–1). Paths with the same command
 * structure morph number-by-number; others switch at the midpoint.
 */
export function interpolatePath(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  if (!pathsCompatible(a, b)) return t < 0.5 ? a : b;
  const nb = b.match(NUM) || [];
  let i = 0;
  return a.replace(NUM, (n) => {
    const v = Number(n) + (Number(nb[i++]) - Number(n)) * t;
    return String(Math.round(v * 1000) / 1000);
  });
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export interface MorphOptions {
  duration?: number;
  easing?: (t: number) => number;
}

/** Animate a `<path>`'s `d` to `to`. Resolves when done; instant under reduced motion. */
export function morphTo(path: SVGPathElement | Element, to: string, o: MorphOptions = {}): Promise<void> {
  const from = path.getAttribute('d') || to;
  const dur = (o.duration ?? 500) * motionScale();
  const prev = (path as any).__usaMorph as number | undefined;
  if (prev) caf(prev);
  if (prefersReducedMotion() || dur <= 0 || from === to) {
    path.setAttribute('d', to);
    return Promise.resolve();
  }
  const fn = o.easing || ease;
  const t0 = now();
  return new Promise((resolve) => {
    const step = () => {
      const t = clamp((now() - t0) / dur, 0, 1);
      path.setAttribute('d', interpolatePath(from, to, fn(t)));
      if (t < 1) (path as any).__usaMorph = raf(step);
      else {
        (path as any).__usaMorph = 0;
        resolve();
      }
    };
    (path as any).__usaMorph = raf(step);
  });
}

const DRAWABLE = 'path, line, polyline, polygon, circle, ellipse, rect';

/**
 * Prepare every stroke in `root` for line drawing (normalised `pathLength=1`,
 * so no `getTotalLength()` is needed) and return a function that sets
 * progress 0–1, optionally staggered between shapes.
 */
export function drawLines(root: Element, o: { stagger?: number } = {}): (progress: number) => void {
  const shapes = Array.from(root.querySelectorAll(DRAWABLE)) as SVGElement[];
  shapes.forEach((s) => {
    s.setAttribute('pathLength', '1');
    s.style.strokeDasharray = '1 1';
  });
  const st = clamp(o.stagger ?? 0, 0, 0.9);
  return (p: number) => {
    const n = shapes.length;
    shapes.forEach((s, i) => {
      const start = n > 1 ? (i / (n - 1)) * st : 0;
      const local = clamp((p - start) / (1 - st || 1), 0, 1);
      s.style.strokeDashoffset = String(1 - local);
    });
  };
}
