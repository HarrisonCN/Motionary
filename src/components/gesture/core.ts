import { clamp } from '../base';

export interface PanState {
  /** Offset from the gesture start (px). */
  dx: number;
  dy: number;
  /** Velocity (px/s). */
  vx: number;
  vy: number;
  first: boolean;
  last: boolean;
  event: Event;
}
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';
export interface SwipeState { direction: SwipeDirection; velocity: number; dx: number; dy: number }
export interface PinchState { scale: number; /** Midpoint of the two pointers (client px). */ x: number; y: number; first: boolean; last: boolean }
export interface PressState { x: number; y: number }

export interface GestureHandlers {
  onPan?: (s: PanState) => void;
  onSwipe?: (s: SwipeState) => void;
  onPinch?: (s: PinchState) => void;
  onLongPress?: (s: PressState) => void;
  onTap?: (s: PressState) => void;
  onDoubleTap?: (s: PressState) => void;
}

export interface GestureOptions {
  /** Restrict panning to an axis. */
  axis?: 'x' | 'y';
  /** Movement (px) before a pan starts (default 4). */
  threshold?: number;
  /** Minimum distance (px, default 40) and speed (px/s, default 300) for a swipe. */
  swipeDistance?: number;
  swipeVelocity?: number;
  /** Long-press delay (ms, default 500). */
  longPress?: number;
  /** Ctrl/⌘ + wheel (trackpad pinch) counts as pinch (default true). */
  wheelPinch?: boolean;
}

/** The swipe a pointer release represents, or `null` (pure). */
export function swipeDirection(dx: number, dy: number, vx: number, vy: number, o: { distance?: number; velocity?: number; axis?: 'x' | 'y' } = {}): SwipeState | null {
  const dist = o.distance ?? 40;
  const vel = o.velocity ?? 300;
  const horiz = o.axis === 'x' || (o.axis !== 'y' && Math.abs(dx) >= Math.abs(dy));
  const d = horiz ? dx : dy;
  const v = horiz ? vx : vy;
  if (Math.abs(d) < dist && Math.abs(v) < vel * 2) return null;
  if (Math.abs(v) < vel && Math.abs(d) < dist * 3) return null;
  const direction: SwipeDirection = horiz ? (d > 0 ? 'right' : 'left') : d > 0 ? 'down' : 'up';
  return { direction, velocity: Math.abs(v), dx, dy };
}

/** Scale between two pointer distances, clamped to [min, max] (pure). */
export function pinchScale(startDistance: number, distance: number, base = 1, min = 0.5, max = 4): number {
  if (!startDistance) return base;
  return clamp(base * (distance / startDistance), min, max);
}

type P = { x: number; y: number };
const pid = (e: any): number => (typeof e.pointerId === 'number' ? e.pointerId : 1);

/**
 * One recognizer for pan, swipe, pinch (two pointers or Ctrl + wheel),
 * long-press, tap and double-tap, with velocities ready to hand to a spring
 * (`createSpring().set(target, velocity)`). Works with mouse, touch and pen
 * through Pointer Events. Returns a cleanup function.
 *
 * @example
 * const x = createSpring({ onUpdate: (v) => (card.style.translate = `${v}px`) });
 * gesture(card, {
 *   onPan: ({ dx, last, vx }) => (last ? x.set(0, vx) : x.jump(dx)),
 *   onSwipe: ({ direction }) => dismiss(direction),
 * }, { axis: 'x' });
 */
export function gesture(el: HTMLElement, h: GestureHandlers, o: GestureOptions = {}): () => void {
  const pts = new Map<number, P>();
  let start: P = { x: 0, y: 0 };
  let last: P & { t: number } = { x: 0, y: 0, t: 0 };
  let vx = 0;
  let vy = 0;
  let panning = false;
  let pinch: { d0: number; first: boolean } | null = null;
  let pinchScaleNow = 1;
  let press: ReturnType<typeof setTimeout> | undefined;
  let pressed = false;
  let lastTap = -1e9;
  const th = o.threshold ?? 4;
  const dist = () => {
    const [a, b] = [...pts.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const mid = () => {
    const [a, b] = [...pts.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };
  const t = (e: Event) => (e.timeStamp || Date.now());

  const down = (e: PointerEvent) => {
    pts.set(pid(e), { x: e.clientX, y: e.clientY });
    try { el.setPointerCapture?.(pid(e)); } catch { /* jsdom / synthetic */ }
    if (pts.size === 2 && h.onPinch) {
      clearTimeout(press);
      if (panning) h.onPan?.({ dx: last.x - start.x, dy: last.y - start.y, vx: 0, vy: 0, first: false, last: true, event: e });
      panning = false;
      pinch = { d0: dist(), first: true };
      return;
    }
    if (pts.size > 1) return;
    start = { x: e.clientX, y: e.clientY };
    last = { ...start, t: t(e) };
    vx = vy = 0;
    pressed = false;
    if (h.onLongPress) press = setTimeout(() => { pressed = true; h.onLongPress?.({ x: start.x, y: start.y }); }, o.longPress ?? 500);
  };
  const move = (e: PointerEvent) => {
    if (!pts.has(pid(e))) return;
    pts.set(pid(e), { x: e.clientX, y: e.clientY });
    if (pinch && pts.size >= 2) {
      const m = mid();
      pinchScaleNow = pinchScale(pinch.d0, dist(), 1, 0.05, 20);
      h.onPinch?.({ scale: pinchScaleNow, x: m.x, y: m.y, first: pinch.first, last: false });
      pinch.first = false;
      return;
    }
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dt = Math.max(1, t(e) - last.t) / 1000;
    vx = (e.clientX - last.x) / dt;
    vy = (e.clientY - last.y) / dt;
    last = { x: e.clientX, y: e.clientY, t: t(e) };
    if (!panning) {
      const off = o.axis === 'x' ? Math.abs(dx) : o.axis === 'y' ? Math.abs(dy) : Math.hypot(dx, dy);
      if (off < th) return;
      clearTimeout(press);
      if (o.axis && Math.abs(o.axis === 'x' ? dy : dx) > off) { pts.delete(pid(e)); return; } // wrong axis: let the page scroll
      panning = true;
      h.onPan?.({ dx: o.axis === 'y' ? 0 : dx, dy: o.axis === 'x' ? 0 : dy, vx, vy, first: true, last: false, event: e });
      return;
    }
    if (e.cancelable) e.preventDefault();
    h.onPan?.({ dx: o.axis === 'y' ? 0 : dx, dy: o.axis === 'x' ? 0 : dy, vx, vy, first: false, last: false, event: e });
  };
  const up = (e: PointerEvent) => {
    if (!pts.has(pid(e))) return;
    pts.delete(pid(e));
    clearTimeout(press);
    if (pinch) {
      if (pts.size < 2) {
        h.onPinch?.({ scale: pinchScaleNow, ...start, first: false, last: true });
        pinch = null;
        pts.clear();
      }
      return;
    }
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (panning) {
      panning = false;
      if (t(e) - last.t > 80) vx = vy = 0; // paused before release
      h.onPan?.({ dx: o.axis === 'y' ? 0 : dx, dy: o.axis === 'x' ? 0 : dy, vx, vy, first: false, last: true, event: e });
      const s = swipeDirection(dx, dy, vx, vy, { distance: o.swipeDistance, velocity: o.swipeVelocity, axis: o.axis });
      if (s) h.onSwipe?.(s);
      return;
    }
    if (pressed || e.type === 'pointercancel') return;
    const p = { x: e.clientX, y: e.clientY };
    const n = t(e);
    if (h.onDoubleTap && n - lastTap < 300) { lastTap = -1e9; h.onDoubleTap(p); return; }
    lastTap = n;
    h.onTap?.(p);
  };
  const wheel = (e: WheelEvent) => {
    if (!h.onPinch || o.wheelPinch === false || !e.ctrlKey) return;
    e.preventDefault();
    const s = Math.exp(-e.deltaY / 100);
    h.onPinch({ scale: s, x: e.clientX, y: e.clientY, first: true, last: true });
  };
  const opts: AddEventListenerOptions = { passive: false };
  el.addEventListener('pointerdown', down as EventListener);
  el.addEventListener('pointermove', move as EventListener, opts);
  el.addEventListener('pointerup', up as EventListener);
  el.addEventListener('pointercancel', up as EventListener);
  el.addEventListener('wheel', wheel as EventListener, opts);
  if (o.axis && !el.style.touchAction) el.style.touchAction = o.axis === 'x' ? 'pan-y' : 'pan-x';
  else if (!o.axis && !el.style.touchAction && (h.onPan || h.onPinch)) el.style.touchAction = 'none';
  return () => {
    clearTimeout(press);
    el.removeEventListener('pointerdown', down as EventListener);
    el.removeEventListener('pointermove', move as EventListener, opts);
    el.removeEventListener('pointerup', up as EventListener);
    el.removeEventListener('pointercancel', up as EventListener);
    el.removeEventListener('wheel', wheel as EventListener, opts);
  };
}
