import { adoptStyles, prefersReducedMotion } from '../base';
import { createSpringGroup, type MicroFeel, type MicroSpringInput, type SpringGroup } from '../physics/spring-solver';
import { projectInertia, rubberBand, snapTo } from '../physics/spring';
import { haptic } from '../click/fx';
import css from './micro.css?raw';

/**
 * 17.16 micro-interaction engine. `micro(el, 'press hover glow')` gives any element spring-driven feedback; every
 * behaviour writes into one spring group per element and one `transform` per frame, so press, hover, tilt, a magnet
 * pull and a shake all add up instead of fighting over the same property. `data-mo-micro="…"` + `applyMicro()` does
 * the same from markup, and `<mo-micro>` wraps any content.
 *
 * Behaviours: `press` (dips and springs back with a little overshoot), `hover` (grows a touch), `lift` (rises with a
 * deepening shadow), `magnetic` (leans toward the pointer and snaps back keeping the pointer's speed), `tilt`
 * (3D tilt toward the pointer), `glow` (a light that follows the pointer, in the look's accent), `squish`
 * (squashes while pressed and wobbles back), `drag` (1:1 drag with rubber-band bounds, a flick that keeps its
 * speed, and grid snapping; arrow keys move it when focused) and `focus` (a focus ring that springs in).
 *
 * Feedback impulses (`feedback(el, kind)`): `shake`, `nod`, `pop`, `wiggle`, `jelly`, `nudge`, `bump`,
 * `attention`. They add velocity to the same springs, so they mix with whatever the element is already doing.
 *
 * The feel comes from `opts.feel`, the closest `[data-mo-feel]` or the `--mo-feel` custom property; a look's
 * `--mo-kit-speed` speeds it up or slows it down. Reduced motion: nothing moves; feedback shows a short outline in
 * the look's ok / bad / accent colour instead.
 */

export type MicroBehavior = 'press' | 'hover' | 'lift' | 'magnetic' | 'tilt' | 'glow' | 'squish' | 'drag' | 'focus';
export const MICRO_BEHAVIORS: readonly MicroBehavior[] = ['press', 'hover', 'lift', 'magnetic', 'tilt', 'glow', 'squish', 'drag', 'focus'];

export type MicroFeedback = 'shake' | 'nod' | 'pop' | 'wiggle' | 'jelly' | 'nudge' | 'bump' | 'attention';
export const MICRO_FEEDBACK: readonly MicroFeedback[] = ['shake', 'nod', 'pop', 'wiggle', 'jelly', 'nudge', 'bump', 'attention'];

/** Impulse (channel velocities), spring and tone of each feedback. */
const IMPULSES: Record<Exclude<MicroFeedback, 'attention'>, [Record<string, number>, MicroSpringInput, 'error' | 'success' | 'info']> = {
  shake: [{ fx: 420 }, '170 0.78', 'error'],
  nod: [{ fy: 200 }, '220 0.6', 'success'],
  pop: [{ s: 1.8 }, 'pop', 'success'],
  wiggle: [{ rz: 240 }, '260 0.72', 'info'],
  jelly: [{ sx: 0.9, sy: -0.9 }, 'jelly', 'info'],
  nudge: [{ fx: 260 }, '300 0.35', 'info'],
  bump: [{ fy: -140 }, 'bouncy', 'info'],
};

export interface MicroOptions {
  /** Feel for every spring (`crisp`, `snappy`, `smooth`, `bouncy`, `playful`, `calm`, `heavy`). */
  feel?: MicroFeel | string | null;
  /** Replace every role spring with one spring (preset name, `"380ms 0.3"`, `{ duration, bounce }` …). */
  spring?: MicroSpringInput;
  /** Short vibrations on press and feedback where the device supports them (off by default). */
  haptics?: boolean;
  /** Pressed scale (default 0.96). */
  pressScale?: number;
  /** Hover scale (default 1.03). */
  hoverScale?: number;
  /** Lift in px (default 4). */
  lift?: number;
  /** Magnet pull, 0–1 of the pointer offset (default 0.35). */
  strength?: number;
  /** Farthest magnet pull in px (default 14). */
  reach?: number;
  /** Largest tilt in degrees (default 8). */
  tilt?: number;
  /** Drag bounds: `'parent'` (default), `'none'` or an element. */
  bounds?: 'parent' | 'none' | Element;
  /** Drag snapping grid in px (default none). */
  snap?: number;
  /** Drag axis (default `'both'`). */
  axis?: 'x' | 'y' | 'both';
  /** Ignore pointer and keys (feedback still plays). */
  disabled?: boolean;
  onPress?: () => void;
  onRelease?: () => void;
  onDragEnd?: (pos: { x: number; y: number }) => void;
}

export interface MicroHandle {
  readonly el: HTMLElement;
  readonly fx: readonly MicroBehavior[];
  readonly group: SpringGroup;
  /** Play a feedback impulse. */
  feedback(kind: MicroFeedback | string): void;
  /** Change behaviours and / or options. */
  update(fx?: string | readonly string[], opts?: MicroOptions): void;
  /** Drag offset in px. */
  readonly position: { x: number; y: number };
  /** Move a draggable element (springs there unless `instant`). */
  moveTo(x: number, y: number, instant?: boolean): void;
  destroy(): void;
}

/** Split a behaviour list (`"press hover, glow"`) into known behaviours, in order, without repeats. */
export function parseMicro(spec: string | readonly string[] | null | undefined): MicroBehavior[] {
  const words = Array.isArray(spec) ? spec : String(spec ?? '').split(/[\s,]+/);
  const out: MicroBehavior[] = [];
  for (const w of words) {
    const k = String(w).trim().toLowerCase() as MicroBehavior;
    if (MICRO_BEHAVIORS.includes(k) && !out.includes(k)) out.push(k);
  }
  return out;
}

/** The feel that applies to `el`: its closest `[data-mo-feel]`, else the `--mo-feel` custom property, else `null`. */
export function readFeel(el: Element): string | null {
  const host = el.closest?.('[data-mo-feel]');
  const v = host?.getAttribute('data-mo-feel')?.trim();
  if (v) return v;
  if (typeof getComputedStyle !== 'function') return null;
  return getComputedStyle(el).getPropertyValue('--mo-feel').trim() || null;
}

/** A look's `--mo-kit-speed` on `el` (1 when unset). */
export function readSpeed(el: Element): number {
  if (typeof getComputedStyle !== 'function') return 1;
  const n = parseFloat(getComputedStyle(el).getPropertyValue('--mo-kit-speed'));
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Channel values → the composed CSS transform (`''` at rest). */
export function microTransform(v: Record<string, number>, o: { pressScale?: number; hoverScale?: number; perspective?: boolean } = {}): string {
  const g = (k: string) => v[k] || 0;
  const scale = 1 + g('hover') * ((o.hoverScale ?? 1.03) - 1) - g('press') * (1 - (o.pressScale ?? 0.96)) + g('s');
  const sx = scale * (1 + g('sx'));
  const sy = scale * (1 + g('sy'));
  const x = g('mx') + g('dx') + g('fx');
  const y = g('my') + g('dy') + g('fy') - g('lift');
  const r = (n: number) => Math.round(n * 1000) / 1000;
  const parts: string[] = [];
  if (Math.abs(x) > 0.01 || Math.abs(y) > 0.01) parts.push(`translate3d(${r(x)}px, ${r(y)}px, 0)`);
  if (Math.abs(g('rx')) > 0.01) parts.push(`rotateX(${r(g('rx'))}deg)`);
  if (Math.abs(g('ry')) > 0.01) parts.push(`rotateY(${r(g('ry'))}deg)`);
  if (Math.abs(g('rz')) > 0.01) parts.push(`rotate(${r(g('rz'))}deg)`);
  if (Math.abs(sx - 1) > 0.0005 || Math.abs(sy - 1) > 0.0005) parts.push(Math.abs(sx - sy) < 0.0005 ? `scale(${r(sx)})` : `scale(${r(sx)}, ${r(sy)})`);
  if (!parts.length) return '';
  return (o.perspective && parts.some((p) => p.startsWith('rotateX') || p.startsWith('rotateY')) ? 'perspective(700px) ' : '') + parts.join(' ');
}

const handles = /*#__PURE__*/ new WeakMap<HTMLElement, MicroHandle>();

/** The micro handle of `el`, if it has one. */
export const microOf = (el: Element): MicroHandle | undefined => handles.get(el as HTMLElement);

const isDisabled = (el: HTMLElement, o: MicroOptions) => !!o.disabled || el.getAttribute('aria-disabled') === 'true' || (el as HTMLButtonElement).disabled === true;

/** Give `el` spring micro-interactions. Calling it again on the same element updates it. */
export function micro(el: HTMLElement, fx: string | readonly string[] = 'press hover', opts: MicroOptions = {}): MicroHandle {
  const had = handles.get(el);
  if (had) {
    had.update(fx, opts);
    return had;
  }
  adoptStyles('micro-17-16', css);
  let o: MicroOptions = { ...opts };
  let list = parseMicro(fx);
  const ownAttr = !el.hasAttribute('data-mo-micro');
  const savedTransform = el.style.transform;
  let off: Array<() => void> = [];
  let pressed = false;
  let inside = false;
  let dragging: null | { id: number; sx: number; sy: number; bx: number; by: number; min: [number, number]; max: [number, number]; moved: boolean; hist: [number, number, number][] } = null;
  let swallowClick = false;
  let pointer: [number, number, number][] = [];
  let flashTimer: ReturnType<typeof setTimeout> | undefined;
  const has = (k: MicroBehavior) => list.includes(k);
  const role = (name: MicroSpringInput) => (o.spring !== undefined && o.spring !== null ? o.spring : name);

  const paint = (v: Record<string, number>) => {
    const t = microTransform(v, { pressScale: o.pressScale, hoverScale: o.hoverScale, perspective: has('tilt') });
    el.style.transform = t || savedTransform;
    const css = el.style;
    if (has('lift')) css.setProperty('--mo-micro-lift', String(Math.round((v.lift || 0) * 100) / 100));
    if (has('glow')) {
      css.setProperty('--mo-micro-glow', String(Math.max(0, Math.min(1, Math.round((v.glow || 0) * 1000) / 1000))));
      css.setProperty('--mo-micro-gx', `${Math.round((v.gx ?? 50) * 10) / 10}%`);
      css.setProperty('--mo-micro-gy', `${Math.round((v.gy ?? 50) * 10) / 10}%`);
    }
    if (has('focus')) css.setProperty('--mo-micro-focus', String(Math.max(0, Math.round((v.focus || 0) * 1000) / 1000)));
    if (has('press')) css.setProperty('--mo-micro-press', String(Math.max(0, Math.min(1, Math.round((v.press || 0) * 1000) / 1000))));
  };
  const group = createSpringGroup({ gx: 50, gy: 50 }, { feel: o.feel ?? readFeel(el), speed: readSpeed(el), owner: el, onUpdate: paint });

  const press = (on: boolean) => {
    if (on === pressed) return;
    pressed = on;
    el.toggleAttribute('data-mo-pressed', on);
    if (on) {
      if (o.haptics) haptic(8);
      o.onPress?.();
      if (has('press')) group.set({ press: 1 }, { spring: role('press') });
      if (has('squish')) group.set({ sx: 0.06, sy: -0.08 }, { spring: role('press') });
      if (has('lift')) group.set({ lift: inside ? (o.lift ?? 4) * 0.35 : 0 }, { spring: role('press') });
    } else {
      o.onRelease?.();
      if (has('press')) group.set({ press: 0 }, { spring: role('release') });
      if (has('squish')) group.set({ sx: 0, sy: 0 }, { spring: role('jelly') });
      if (has('lift')) group.set({ lift: inside ? o.lift ?? 4 : 0 }, { spring: role('release') });
    }
  };
  const enter = () => {
    inside = true;
    if (has('hover')) group.set({ hover: 1 }, { spring: role('hover') });
    if (has('lift')) group.set({ lift: pressed ? (o.lift ?? 4) * 0.35 : o.lift ?? 4 }, { spring: role('hover') });
    if (has('glow')) group.set({ glow: 1 }, { spring: role('hover') });
  };
  const pointerSpeed = (): [number, number] => {
    const h = pointer.filter((p) => p[2] > performance.now() - 100);
    if (h.length < 2) return [0, 0];
    const a = h[0];
    const b = h[h.length - 1];
    const dt = Math.max(1, b[2] - a[2]) / 1000;
    return [(b[0] - a[0]) / dt, (b[1] - a[1]) / dt];
  };
  const leave = () => {
    inside = false;
    press(false);
    if (has('hover')) group.set({ hover: 0 }, { spring: role('settle') });
    if (has('lift')) group.set({ lift: 0 }, { spring: role('settle') });
    if (has('glow')) group.set({ glow: 0 }, { spring: role('smooth') });
    if (has('tilt')) group.set({ rx: 0, ry: 0 }, { spring: role('settle') });
    if (has('magnetic')) {
      const [vx, vy] = pointerSpeed();
      const s = Math.min(1, Math.max(0, o.strength ?? 0.35));
      const cap = 1600;
      group.set({ mx: 0, my: 0 }, { spring: role('release'), velocity: { mx: Math.max(-cap, Math.min(cap, vx * s)), my: Math.max(-cap, Math.min(cap, vy * s)) } });
    }
    pointer = [];
  };
  const move = (e: PointerEvent) => {
    pointer.push([e.clientX, e.clientY, performance.now()]);
    if (pointer.length > 8) pointer.shift();
    if (dragging || !(has('magnetic') || has('tilt') || has('glow'))) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    // the element's own transform moves its box: measure from the untransformed centre
    const v = group.values;
    const cx = r.left + r.width / 2 - ((v.mx || 0) + (v.dx || 0) + (v.fx || 0));
    const cy = r.top + r.height / 2 - ((v.my || 0) + (v.dy || 0) + (v.fy || 0) - (v.lift || 0));
    const px = (e.clientX - cx) / r.width;
    const py = (e.clientY - cy) / r.height;
    if (has('magnetic')) {
      const s = Math.min(1, Math.max(0, o.strength ?? 0.35));
      const reach = Math.max(0, o.reach ?? 14);
      const clampR = (n: number) => Math.max(-reach, Math.min(reach, n));
      group.set({ mx: clampR(px * r.width * s), my: clampR(py * r.height * s) }, { spring: role('snappy') });
    }
    if (has('tilt')) {
      const t = Math.min(30, Math.max(0, o.tilt ?? 8));
      group.set({ ry: Math.max(-1, Math.min(1, px * 2)) * t, rx: -Math.max(-1, Math.min(1, py * 2)) * t }, { spring: role('hover') });
    }
    if (has('glow')) group.set({ gx: (px + 0.5) * 100, gy: (py + 0.5) * 100 }, { spring: role('drag') });
  };

  /* drag */
  const bounds = (): [[number, number], [number, number]] => {
    const none: [[number, number], [number, number]] = [[-Infinity, -Infinity], [Infinity, Infinity]];
    const b = o.bounds ?? 'parent';
    if (b === 'none') return none;
    const box = b === 'parent' ? el.parentElement : b;
    if (!box) return none;
    const pr = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const v = group.values;
    const left = r.left - ((v.mx || 0) + (v.dx || 0) + (v.fx || 0));
    const top = r.top - ((v.my || 0) + (v.dy || 0) + (v.fy || 0) - (v.lift || 0));
    const minX = Math.min(0, pr.left - left);
    const maxX = Math.max(0, pr.right - (left + r.width));
    const minY = Math.min(0, pr.top - top);
    const maxY = Math.max(0, pr.bottom - (top + r.height));
    return [[minX, minY], [maxX, maxY]];
  };
  const band = (n: number, min: number, max: number, dim: number) => (n < min ? min + rubberBand(n - min, dim) : n > max ? max + rubberBand(n - max, dim) : n);
  const dragDown = (e: PointerEvent) => {
    // catch a moving element where it is (only the drag channels stop; press / hover keep springing)
    group.jump({ dx: group.get('dx'), dy: group.get('dy') });
    const [min, max] = bounds();
    dragging = { id: e.pointerId, sx: e.clientX, sy: e.clientY, bx: group.get('dx'), by: group.get('dy'), min, max, moved: false, hist: [[e.clientX, e.clientY, performance.now()]] };
    try {
      el.setPointerCapture?.(e.pointerId);
    } catch {
      /* synthetic events */
    }
  };
  const dragMove = (e: PointerEvent) => {
    const d = dragging;
    if (!d || e.pointerId !== d.id) return;
    let x = d.bx + (e.clientX - d.sx);
    let y = d.by + (e.clientY - d.sy);
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 4) {
      d.moved = true;
      el.setAttribute('data-mo-dragging', '');
    }
    d.hist.push([e.clientX, e.clientY, performance.now()]);
    if (d.hist.length > 6) d.hist.shift();
    const r = el.getBoundingClientRect();
    if (o.axis === 'y') x = d.bx;
    if (o.axis === 'x') y = d.by;
    x = band(x, d.min[0], d.max[0], Math.max(80, r.width));
    y = band(y, d.min[1], d.max[1], Math.max(80, r.height));
    group.jump({ dx: x, dy: y });
  };
  const settleTo = (x: number, y: number, vx = 0, vy = 0, spring: MicroSpringInput = 'settle') => {
    const [min, max] = bounds();
    let tx = Math.max(min[0], Math.min(max[0], x));
    let ty = Math.max(min[1], Math.min(max[1], y));
    if (o.snap && o.snap > 0) {
      tx = Math.max(min[0], Math.min(max[0], snapTo(tx, o.snap)));
      ty = Math.max(min[1], Math.min(max[1], snapTo(ty, o.snap)));
    }
    if (o.axis === 'y') tx = group.target('dx');
    if (o.axis === 'x') ty = group.target('dy');
    group.set({ dx: tx, dy: ty }, { spring: role(spring), velocity: { dx: vx, dy: vy } });
    return { x: tx, y: ty };
  };
  const dragUp = (e: PointerEvent) => {
    const d = dragging;
    if (!d || e.pointerId !== d.id) return;
    dragging = null;
    el.removeAttribute('data-mo-dragging');
    const h = d.hist.filter((p) => p[2] > performance.now() - 120);
    let vx = 0;
    let vy = 0;
    if (h.length > 1 && e.type !== 'pointercancel') {
      const a = h[0];
      const b = h[h.length - 1];
      const dt = Math.max(8, b[2] - a[2]) / 1000;
      vx = (b[0] - a[0]) / dt;
      vy = (b[1] - a[1]) / dt;
    }
    const cap = 4000;
    vx = Math.max(-cap, Math.min(cap, vx));
    vy = Math.max(-cap, Math.min(cap, vy));
    const x = group.get('dx');
    const y = group.get('dy');
    const end = settleTo(projectInertia(x, vx, 0.2), projectInertia(y, vy, 0.2), vx, vy);
    if (d.moved) {
      swallowClick = true;
      setTimeout(() => (swallowClick = false), 0);
      o.onDragEnd?.(end);
    }
  };

  const on = (t: EventTarget, type: string, fn: (e: any) => void, opt?: AddEventListenerOptions) => {
    t.addEventListener(type, fn, opt);
    off.push(() => t.removeEventListener(type, fn, opt));
  };
  const bind = () => {
    off.forEach((f) => f());
    off = [];
    if (!list.length) return;
    const hoverish = has('hover') || has('lift') || has('magnetic') || has('tilt') || has('glow');
    on(el, 'pointerenter', (e: PointerEvent) => {
      if (isDisabled(el, o)) return;
      if (e.pointerType !== 'touch' && hoverish) enter();
    });
    on(el, 'pointerleave', (e: PointerEvent) => {
      if (dragging) return;
      if (e.pointerType === 'touch') return press(false);
      leave();
    });
    on(el, 'pointermove', (e: PointerEvent) => {
      if (isDisabled(el, o)) return;
      if (dragging) return dragMove(e);
      if (e.pointerType !== 'touch') move(e);
    }, { passive: true });
    on(el, 'pointerdown', (e: PointerEvent) => {
      if (isDisabled(el, o) || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (has('glow') && e.pointerType === 'touch') {
        move(e);
        group.set({ glow: 1 }, { spring: role('hover') });
      }
      if (has('press') || has('squish') || has('lift')) press(true);
      if (has('drag')) dragDown(e);
    });
    const up = (e: PointerEvent) => {
      if (dragging) dragUp(e);
      press(false);
      if (has('glow') && e.pointerType === 'touch') group.set({ glow: 0 }, { spring: role('smooth') });
    };
    on(el, 'pointerup', up);
    on(el, 'pointercancel', up);
    on(el, 'lostpointercapture', (e: PointerEvent) => dragging && dragUp(e));
    on(el, 'click', (e: MouseEvent) => {
      if (swallowClick) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { capture: true });
    on(el, 'keydown', (e: KeyboardEvent) => {
      if (isDisabled(el, o)) return;
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && (has('press') || has('squish'))) press(true);
      if (has('drag') && e.target === el && e.key.startsWith('Arrow')) {
        e.preventDefault();
        // with a snap grid the keys move a whole cell (else 16 px, 64 with Shift)
        const step = (o.snap && o.snap > 0 ? o.snap : 16) * (e.shiftKey ? 4 : 1);
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        const end = settleTo(group.target('dx') + dx, group.target('dy') + dy, 0, 0, 'snappy');
        o.onDragEnd?.(end);
      }
    });
    on(el, 'keyup', (e: KeyboardEvent) => (e.key === ' ' || e.key === 'Enter') && press(false));
    on(el, 'blur', () => press(false), { capture: true });
    if (has('focus')) {
      // focusin / focusout so a wrapper reacts to the control inside it too
      on(el, 'focusin', (e: FocusEvent) => {
        let visible = true;
        try {
          visible = (e.target as Element).matches(':focus-visible');
        } catch {
          /* old engines */
        }
        if (visible) group.set({ focus: 1 }, { spring: role('pop') });
      });
      on(el, 'focusout', (e: FocusEvent) => {
        if (!el.contains(e.relatedTarget as Node | null)) group.set({ focus: 0 }, { spring: role('smooth') });
      });
    }
  };

  const syncAttr = () => {
    if (ownAttr) el.setAttribute('data-mo-micro', list.join(' '));
  };
  syncAttr();
  bind();

  const flash = (tone: string) => {
    clearTimeout(flashTimer);
    el.setAttribute('data-mo-micro-flash', tone);
    flashTimer = setTimeout(() => el.removeAttribute('data-mo-micro-flash'), 700);
  };

  const handle: MicroHandle = {
    el,
    get fx() {
      return list.slice();
    },
    group,
    get position() {
      return { x: group.target('dx'), y: group.target('dy') };
    },
    feedback(kind) {
      const k = String(kind) as MicroFeedback;
      if (!MICRO_FEEDBACK.includes(k)) return;
      const parts = k === 'attention' ? (['pop', 'wiggle'] as const) : ([k] as const);
      const tone = k === 'attention' ? 'info' : IMPULSES[k as keyof typeof IMPULSES][2];
      if (o.haptics) haptic(tone === 'error' ? [10, 50, 10] : 12);
      if (prefersReducedMotion()) return flash(tone);
      for (const p of parts) {
        const [vel, spring] = IMPULSES[p];
        group.impulse(vel, spring);
      }
    },
    update(next, opts2) {
      if (opts2) o = { ...o, ...opts2 };
      if (next !== undefined) {
        const was = list.join(' ');
        list = parseMicro(next);
        if (list.join(' ') !== was) {
          syncAttr();
          bind();
        }
      } else bind();
      group.configure({ feel: o.feel ?? readFeel(el), speed: readSpeed(el) });
      if (!has('drag')) group.jump({ dx: 0, dy: 0 });
    },
    moveTo(x, y, instant) {
      if (instant) group.jump({ dx: x, dy: y });
      else settleTo(x, y, 0, 0, 'settle');
    },
    destroy() {
      off.forEach((f) => f());
      off = [];
      group.stop();
      clearTimeout(flashTimer);
      handles.delete(el);
      el.style.transform = savedTransform;
      for (const p of ['--mo-micro-lift', '--mo-micro-glow', '--mo-micro-gx', '--mo-micro-gy', '--mo-micro-focus', '--mo-micro-press']) el.style.removeProperty(p);
      for (const a of ['data-mo-pressed', 'data-mo-dragging', 'data-mo-micro-flash']) el.removeAttribute(a);
      if (ownAttr) el.removeAttribute('data-mo-micro');
    },
  };
  handles.set(el, handle);
  return handle;
}

/**
 * Play a feedback impulse on any element (`shake` for an error, `nod` / `pop` for success, `wiggle`, `jelly`,
 * `nudge`, `bump`, `attention`). Elements without `micro()` get a temporary handle that goes away when they settle.
 */
export function feedback(el: HTMLElement, kind: MicroFeedback | string, opts: Pick<MicroOptions, 'feel' | 'haptics'> = {}): void {
  const had = handles.get(el);
  if (had) return had.feedback(kind);
  const h = micro(el, [], opts);
  h.feedback(kind);
  const done = () => (h.group.animating ? setTimeout(done, 120) : h.destroy());
  setTimeout(done, prefersReducedMotion() ? 760 : 120);
}

const fromData = (el: HTMLElement): MicroOptions => {
  const d = el.dataset;
  const n = (v?: string) => (v !== undefined && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : undefined);
  const b = d.moBounds;
  return {
    feel: d.moFeel || undefined,
    spring: d.moSpring || undefined,
    haptics: d.moHaptics !== undefined && d.moHaptics !== 'false',
    pressScale: n(d.moPressScale),
    hoverScale: n(d.moHoverScale),
    lift: n(d.moLift),
    strength: n(d.moStrength),
    reach: n(d.moReach),
    tilt: n(d.moTilt),
    snap: n(d.moSnap),
    axis: d.moAxis === 'x' || d.moAxis === 'y' ? d.moAxis : 'both',
    bounds: b === 'none' ? 'none' : b && b !== 'parent' ? (el.closest(b) as Element | null) || 'parent' : 'parent',
  };
};

/**
 * Wire every `[data-mo-micro]` element under `root` (default `document`) and keep watching for new, changed and
 * removed ones. Options come from `data-mo-*` attributes (`data-mo-feel`, `data-mo-spring`, `data-mo-haptics`,
 * `data-mo-press-scale`, `data-mo-hover-scale`, `data-mo-lift`, `data-mo-strength`, `data-mo-reach`, `data-mo-tilt`,
 * `data-mo-snap`, `data-mo-axis`, `data-mo-bounds`). Returns a function that stops watching and undoes it all.
 */
export function applyMicro(root: ParentNode = document): () => void {
  if (typeof document === 'undefined') return () => {};
  const mine = new Set<HTMLElement>();
  const wire = (el: HTMLElement) => {
    const spec = el.getAttribute('data-mo-micro');
    if (spec === null) return;
    const h = handles.get(el);
    if (h && !mine.has(el)) return; // wired by code or by <mo-micro>
    if (h) h.update(spec, fromData(el));
    else {
      micro(el, spec, fromData(el));
      mine.add(el);
    }
  };
  const scan = (node: ParentNode) => {
    if (node instanceof HTMLElement && node.hasAttribute('data-mo-micro')) wire(node);
    node.querySelectorAll?.<HTMLElement>('[data-mo-micro]').forEach(wire);
  };
  scan(root);
  if (typeof MutationObserver === 'undefined') return () => mine.forEach((el) => handles.get(el)?.destroy());
  const mo = new MutationObserver((recs) => {
    for (const r of recs) {
      if (r.type === 'attributes') {
        const el = r.target as HTMLElement;
        if (el.hasAttribute('data-mo-micro')) wire(el);
        else if (mine.has(el)) {
          handles.get(el)?.destroy();
          mine.delete(el);
        }
        continue;
      }
      r.addedNodes.forEach((n) => n.nodeType === 1 && scan(n as HTMLElement));
      r.removedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        for (const el of [...mine]) if (!el.isConnected && (n === el || (n as Element).contains(el))) {
          handles.get(el)?.destroy();
          mine.delete(el);
        }
      });
    }
  });
  mo.observe(root as Node, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-mo-micro'] });
  return () => {
    mo.disconnect();
    mine.forEach((el) => handles.get(el)?.destroy());
    mine.clear();
  };
}
