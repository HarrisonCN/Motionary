import { prefersReducedMotion, raf, caf, now } from '../base';
import { springSamples } from '../physics/spring';

/**
 * `smoothScroll()` — inertial wheel smoothing for the page (or a scroll
 * container): wheel deltas are eased with a lerp each frame. Touch and
 * keyboard scrolling stay native. Returns a function that turns it off.
 * No-op under reduced motion, on touch-only devices and on the server.
 */
export interface SmoothScrollOptions {
  /** Scroll container (default: the page). */
  target?: HTMLElement | null;
  /** 0–1, lower = smoother / longer glide (default 0.12). */
  lerp?: number;
  /** Wheel multiplier (default 1). */
  wheelMultiplier?: number;
}

export function smoothScroll(options: SmoothScrollOptions = {}): () => void {
  if (typeof window === 'undefined' || prefersReducedMotion()) return () => undefined;
  const el = options.target || null;
  const lerp = Math.min(1, Math.max(0.02, options.lerp ?? 0.12));
  const mult = options.wheelMultiplier ?? 1;
  const get = () => (el ? el.scrollTop : window.scrollY);
  const max = () => (el ? el.scrollHeight - el.clientHeight : document.documentElement.scrollHeight - window.innerHeight);
  const set = (y: number) => (el ? (el.scrollTop = y) : window.scrollTo(0, y));
  let target = get();
  let current = target;
  let id = 0;
  const loop = () => {
    current += (target - current) * lerp;
    if (Math.abs(target - current) < 0.5) current = target;
    set(current);
    id = current === target ? 0 : raf(loop);
  };
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.defaultPrevented) return;
    if (!id) target = current = get();
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * (window.innerHeight || 800) : e.deltaY;
    target = Math.max(0, Math.min(max(), target + dy * mult));
    if (!id) id = raf(loop);
  };
  const onScroll = () => {
    if (!id) target = current = get();
  };
  const host: EventTarget = el || window;
  host.addEventListener('wheel', onWheel as EventListener, { passive: false });
  host.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    host.removeEventListener('wheel', onWheel as EventListener);
    host.removeEventListener('scroll', onScroll);
    if (id) caf(id);
    id = 0;
  };
}

/**
 * Scroll to a y position, element or selector with spring timing (or
 * instantly under reduced motion). Resolves when done.
 */
export function scrollToTarget(to: number | Element | string, options: { offset?: number; target?: HTMLElement | null; preset?: string } = {}): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  const el = options.target || null;
  const start = el ? el.scrollTop : window.scrollY;
  let y = typeof to === 'number' ? to : 0;
  if (typeof to !== 'number') {
    const node = typeof to === 'string' ? document.querySelector(to) : to;
    if (!node) return Promise.resolve();
    const top = node.getBoundingClientRect().top;
    y = start + top - (el ? el.getBoundingClientRect().top : 0);
  }
  y = Math.max(0, y - (options.offset ?? 0));
  const set = (v: number) => (el ? (el.scrollTop = v) : window.scrollTo(0, v));
  if (prefersReducedMotion()) {
    set(y);
    return Promise.resolve();
  }
  const { values, duration } = springSamples(options.preset || 'slow');
  const t0 = now();
  return new Promise((resolve) => {
    const step = () => {
      const p = Math.min(1, (now() - t0) / Math.max(1, duration));
      const v = values[Math.min(values.length - 1, Math.round(p * (values.length - 1)))];
      set(start + (y - start) * v);
      if (p < 1) raf(step);
      else resolve();
    };
    raf(step);
  });
}
