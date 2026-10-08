/**
 * 5.7 — cursor & gesture packs.
 *
 * Cursor effects (kind `cursor`, persistent, scoped to the element they are
 * bound to; skipped under reduced motion and — unless `touch: true` — for
 * touch pointers): `comet-trail`, `sparkle-trail`, `ribbon-trail`,
 * `magnetic-dots`, `spotlight-cursor`.
 *
 * Gestures → effects: `bindGesture(el, 'fling' | 'twist' | 'long-press',
 * effectOrCallback, options)` and `<usa-gesture-fx gesture effect>`. A fling
 * is a fast release, a twist a two-finger rotation past `angle` degrees, a
 * long press "charges" `--usa-charge` 0 → 1 and fires when full. Every fire
 * dispatches `usa-gesture` (`detail: { gesture, … }`). The effect itself goes
 * through `playEffect()`, so reduced motion is honoured there.
 */
import type { EffectContext, EffectDefinition } from '../fx/registry';
import { playEffect } from '../fx/registry';
import { defineElement, type UsaElement } from '../base';
import { fxLayer, PALETTE, rand, spawn } from './shared';
import { canvasBackground, hexRgb } from './generative';

type Pt = { x: number; y: number; t: number };

const touchOk = (e: PointerEvent, o: any) => o.touch || e.pointerType !== 'touch';

/** A fixed, viewport-sized canvas in the fx layer, redrawn while `draw` returns true. */
function overlayCanvas(draw: (g: CanvasRenderingContext2D, w: number, h: number, now: number) => boolean): { kick: () => void; stop: () => void } {
  const c = document.createElement('canvas');
  c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  fxLayer().appendChild(c);
  const g = c.getContext('2d');
  let raf = 0;
  const frame = (now: number) => {
    raf = 0;
    if (!g) return;
    const w = innerWidth;
    const h = innerHeight;
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    if (draw(g, w, h, now)) raf = requestAnimationFrame(frame);
  };
  return {
    kick: () => {
      if (!raf && g) raf = requestAnimationFrame(frame);
    },
    stop: () => {
      cancelAnimationFrame(raf);
      raf = 0;
      c.remove();
    },
  };
}

/** Pointer trail on `el`: keeps the last `life` ms of points and redraws them. */
function trail(el: HTMLElement, o: any, paint: (g: CanvasRenderingContext2D, pts: Pt[], now: number) => void): () => void {
  const pts: Pt[] = [];
  const oc = overlayCanvas((g, _w, _h, now) => {
    while (pts.length && now - pts[0].t > o.life) pts.shift();
    if (pts.length > 1) paint(g, pts, now);
    return pts.length > 0;
  });
  const move = (e: PointerEvent) => {
    if (!touchOk(e, o)) return;
    pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (pts.length > 64) pts.shift();
    oc.kick();
  };
  el.addEventListener('pointermove', move, { passive: true });
  return () => {
    el.removeEventListener('pointermove', move);
    oc.stop();
  };
}

export const CURSOR_FX: EffectDefinition[] = [
  {
    name: 'comet-trail',
    kind: 'cursor',
    description: 'A glowing comet tail follows the pointer over the element (persistent; `color`, `width`, `life`).',
    defaults: { color: '#7c5cff', width: 10, life: 320, touch: false },
    run: (el, o: any) =>
      trail(el, o, (g, pts, now) => {
        const [r, gg, b] = hexRgb(o.color);
        g.lineCap = 'round';
        for (let i = 1; i < pts.length; i++) {
          const k = 1 - (now - pts[i].t) / o.life;
          g.strokeStyle = `rgba(${r},${gg},${b},${(k * 0.9).toFixed(3)})`;
          g.lineWidth = Math.max(0.5, o.width * k);
          g.beginPath();
          g.moveTo(pts[i - 1].x, pts[i - 1].y);
          g.lineTo(pts[i].x, pts[i].y);
          g.stroke();
        }
      }),
  },
  {
    name: 'ribbon-trail',
    kind: 'cursor',
    description: 'A smooth rainbow ribbon flows behind the pointer (persistent; `width`, `life`).',
    defaults: { width: 18, life: 600, touch: false },
    run: (el, o: any) =>
      trail(el, o, (g, pts, now) => {
        for (let i = 2; i < pts.length; i++) {
          const k = 1 - (now - pts[i].t) / o.life;
          const a = pts[i - 2];
          const m = pts[i - 1];
          const b = pts[i];
          g.strokeStyle = `hsla(${(pts[i].t / 6) % 360},90%,62%,${(k * 0.85).toFixed(3)})`;
          g.lineWidth = Math.max(0.5, o.width * k * Math.sin(Math.PI * Math.min(1, (i / pts.length) * 1.1)));
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo((a.x + m.x) / 2, (a.y + m.y) / 2);
          g.quadraticCurveTo(m.x, m.y, (m.x + b.x) / 2, (m.y + b.y) / 2);
          g.stroke();
        }
      }),
  },
  {
    name: 'sparkle-trail',
    kind: 'cursor',
    description: 'Little stars twinkle off the pointer as it moves (persistent; `colors`, `spacing` px between stars).',
    defaults: { colors: PALETTE, spacing: 14, size: 14, touch: false },
    run: (el, o: any, ctx: EffectContext) => {
      let lx = -1e4;
      let ly = -1e4;
      const move = (e: PointerEvent) => {
        if (!touchOk(e, o) || Math.hypot(e.clientX - lx, e.clientY - ly) < o.spacing) return;
        lx = e.clientX;
        ly = e.clientY;
        const s = o.size * rand(0.6, 1.2);
        spawn(e.clientX - s / 2, e.clientY - s / 2, `font-size:${s}px;line-height:1;color:${o.colors[Math.floor(rand(0, o.colors.length))]}`, ctx,
          [{ transform: 'translate(0,0) scale(0) rotate(0deg)', opacity: 1 }, { transform: `translate(${rand(-14, 14)}px,${rand(4, 26)}px) scale(1) rotate(${rand(-90, 90)}deg)`, opacity: 0 }],
          { duration: rand(500, 800), easing: 'ease-out' }, '✦');
      };
      el.addEventListener('pointermove', move, { passive: true });
      return () => el.removeEventListener('pointermove', move);
    },
  },
  {
    name: 'magnetic-dots',
    kind: 'cursor',
    description: 'A grid of dots behind the content leans toward the pointer like iron filings to a magnet (persistent; `gap`, `radius`, `color`).',
    defaults: { gap: 22, radius: 120, color: '#7c5cff', background: 'transparent', touch: false },
    reduced: 'skip',
    run: (el, o: any, ctx) => {
      const p = { x: -1e4, y: -1e4 };
      const move = (e: PointerEvent) => {
        if (!touchOk(e, o)) return;
        const r = el.getBoundingClientRect();
        p.x = e.clientX - r.left;
        p.y = e.clientY - r.top;
      };
      const leave = () => ((p.x = -1e4), (p.y = -1e4));
      el.addEventListener('pointermove', move, { passive: true });
      el.addEventListener('pointerleave', leave);
      const off = canvasBackground(el, ctx, {
        draw: ({ ctx: g, w, h }) => {
          g.clearRect(0, 0, w, h);
          if (o.background !== 'transparent') {
            g.fillStyle = o.background;
            g.fillRect(0, 0, w, h);
          }
          g.fillStyle = o.color;
          for (let y = o.gap / 2; y < h; y += o.gap)
            for (let x = o.gap / 2; x < w; x += o.gap) {
              const dx = p.x - x;
              const dy = p.y - y;
              const d = Math.hypot(dx, dy);
              const k = d < o.radius ? (1 - d / o.radius) ** 2 : 0;
              const s = 1.5 + k * 3;
              g.globalAlpha = 0.35 + k * 0.65;
              g.fillRect(x + dx * k * 0.35 - s / 2, y + dy * k * 0.35 - s / 2, s, s);
            }
          g.globalAlpha = 1;
        },
      }, o);
      return () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
        off();
      };
    },
  },
  {
    name: 'spotlight-cursor',
    kind: 'cursor',
    description: 'A soft light follows the pointer across the element, easing behind it (persistent; `color`, `size`).',
    defaults: { color: '#ffffff', size: 260, ease: 0.18, touch: false },
    run: (el, o: any) => {
      const [r, g, b] = hexRgb(o.color);
      const s = document.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      s.style.cssText = `position:absolute;inset:0;pointer-events:none;border-radius:inherit;opacity:0;transition:opacity .25s;mix-blend-mode:soft-light;background:radial-gradient(circle ${o.size / 2}px at var(--sx,50%) var(--sy,50%),rgba(${r},${g},${b},.75),transparent)`;
      const restore = el.style.position;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.appendChild(s);
      let tx = 0;
      let ty = 0;
      let x = 0;
      let y = 0;
      let raf = 0;
      const tick = () => {
        x += (tx - x) * o.ease;
        y += (ty - y) * o.ease;
        s.style.setProperty('--sx', `${x.toFixed(1)}px`);
        s.style.setProperty('--sy', `${y.toFixed(1)}px`);
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(tick) : 0;
      };
      const move = (e: PointerEvent) => {
        if (!touchOk(e, o)) return;
        const rc = el.getBoundingClientRect();
        tx = e.clientX - rc.left;
        ty = e.clientY - rc.top;
        if (s.style.opacity !== '1') ((x = tx), (y = ty), (s.style.opacity = '1'));
        if (!raf) raf = requestAnimationFrame(tick);
      };
      const leave = () => (s.style.opacity = '0');
      el.addEventListener('pointermove', move, { passive: true });
      el.addEventListener('pointerleave', leave);
      return () => {
        cancelAnimationFrame(raf);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
        s.remove();
        el.style.position = restore;
      };
    },
  },
];

// --- gestures → effects ------------------------------------------------------

export const GESTURES = ['fling', 'twist', 'long-press'] as const;
export type GestureName = (typeof GESTURES)[number];

export interface GestureFxOptions {
  /** fling: minimum release speed in px/ms (default 0.8). */
  velocity?: number;
  /** twist: degrees of rotation that fire (default 30). */
  angle?: number;
  /** long-press: ms to fully charge (default 650). */
  duration?: number;
  /** long-press: px the pointer may move before the press is cancelled (default 10). */
  tolerance?: number;
  /** Options passed to the effect. */
  effectOptions?: Record<string, unknown>;
}

export interface GestureDetail {
  gesture: GestureName;
  /** fling */
  vx?: number;
  vy?: number;
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down' | 'cw' | 'ccw';
  /** twist: signed degrees since the last fire. */
  angle?: number;
  /** long-press: 1 when fired. */
  charge?: number;
}

/** Release velocity (px/ms) from recent pointer samples: uses the last `window` ms (pure). */
export function flingVelocity(pts: Pt[], window = 90): { vx: number; vy: number; speed: number } {
  if (pts.length < 2) return { vx: 0, vy: 0, speed: 0 };
  const last = pts[pts.length - 1];
  let first = pts[0];
  for (let i = pts.length - 2; i >= 0; i--) {
    first = pts[i];
    if (last.t - pts[i].t >= window) break;
  }
  const dt = Math.max(1, last.t - first.t);
  const vx = (last.x - first.x) / dt;
  const vy = (last.y - first.y) / dt;
  return { vx, vy, speed: Math.hypot(vx, vy) };
}

/** Signed smallest difference between two angles in degrees, in (-180, 180] (pure). */
export function angleDelta(a: number, b: number): number {
  let d = (b - a) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

/**
 * Fire `effect` (a registered effect name, or a callback) when `gesture`
 * happens on `el`. Returns an unbind.
 */
export function bindGesture(el: HTMLElement, gesture: GestureName, effect: string | ((d: GestureDetail, e: Event) => void), o: GestureFxOptions = {}): () => void {
  const { velocity = 0.8, angle = 30, duration = 650, tolerance = 10, effectOptions = {} } = o;
  const pts = new Map<number, { x: number; y: number }>();
  let path: Pt[] = [];
  let base: number | null = null;
  let press: { x: number; y: number; t0: number; raf: number } | null = null;
  const fire = (d: GestureDetail, e: Event) => {
    el.dispatchEvent(new CustomEvent('usa-gesture', { detail: d, bubbles: true }));
    if (typeof effect === 'function') effect(d, e);
    else playEffect(el, effect, effectOptions, e).catch(() => undefined);
  };
  const twistAngle = () => {
    const [a, b] = [...pts.values()];
    return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  };
  const charge = (k: number) => {
    el.style.setProperty('--usa-charge', k.toFixed(3));
    el.toggleAttribute('data-charging', k > 0 && k < 1);
  };
  const endPress = () => {
    if (!press) return;
    cancelAnimationFrame(press.raf);
    press = null;
    charge(0);
  };
  const down = (e: PointerEvent) => {
    pts.set(e.pointerId ?? 1, { x: e.clientX, y: e.clientY });
    if (gesture === 'fling') path = [{ x: e.clientX, y: e.clientY, t: e.timeStamp || performance.now() }];
    if (gesture === 'twist' && pts.size === 2) base = twistAngle();
    if (gesture === 'long-press' && pts.size === 1) {
      press = { x: e.clientX, y: e.clientY, t0: performance.now(), raf: 0 };
      const step = (now: number) => {
        if (!press) return;
        const k = Math.min(1, (now - press.t0) / duration);
        charge(k);
        if (k >= 1) {
          endPress();
          el.style.setProperty('--usa-charge', '1');
          fire({ gesture, charge: 1 }, e);
        } else press.raf = requestAnimationFrame(step);
      };
      press.raf = requestAnimationFrame(step);
    }
  };
  const move = (e: PointerEvent) => {
    if (!pts.has(e.pointerId ?? 1)) return;
    pts.set(e.pointerId ?? 1, { x: e.clientX, y: e.clientY });
    if (gesture === 'fling') {
      path.push({ x: e.clientX, y: e.clientY, t: e.timeStamp || performance.now() });
      if (path.length > 20) path.shift();
    } else if (gesture === 'twist' && pts.size >= 2 && base !== null) {
      const now = twistAngle();
      const d = angleDelta(base, now);
      if (Math.abs(d) >= angle) {
        base = now;
        fire({ gesture, angle: d, direction: d > 0 ? 'cw' : 'ccw' }, e);
      }
    } else if (gesture === 'long-press' && press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > tolerance) endPress();
  };
  const up = (e: PointerEvent) => {
    pts.delete(e.pointerId ?? 1);
    if (gesture === 'fling' && path.length) {
      path.push({ x: e.clientX, y: e.clientY, t: e.timeStamp || performance.now() });
      const v = flingVelocity(path);
      path = [];
      if (v.speed >= velocity) {
        const direction = Math.abs(v.vx) > Math.abs(v.vy) ? (v.vx > 0 ? 'right' : 'left') : v.vy > 0 ? 'down' : 'up';
        fire({ gesture, ...v, direction }, e);
      }
    }
    if (pts.size < 2) base = null;
    endPress();
  };
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  if (gesture === 'twist' && !el.style.touchAction) el.style.touchAction = 'none';
  return () => {
    endPress();
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
  };
}

export interface UsaGestureFxElement extends UsaElement {
  readonly gesture: GestureName;
}

/**
 * `<usa-gesture-fx gesture="fling | twist | long-press" effect="tada"
 * options='{"…"}' velocity angle duration>` — plays `effect` on its first
 * child (or itself with `self`) when the gesture happens.
 */
export function defineGestureFx(tag = 'usa-gesture-fx'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) =>
      class UsaGestureFx extends Base {
        static get observedAttributes(): string[] {
          return ['gesture', 'effect', 'options'];
        }
        get gesture(): GestureName {
          const g = this.str('gesture', 'fling') as GestureName;
          return GESTURES.includes(g) ? g : 'fling';
        }
        mount(): void {
          let effectOptions = {};
          try {
            effectOptions = JSON.parse(this.str('options', '{}')) || {};
          } catch {
            /* ignore bad JSON */
          }
          const target = this.flag('self') ? this : (this.firstElementChild as HTMLElement) || this;
          const effect = this.str('effect', 'pulse');
          this.onCleanup(
            bindGesture(this, this.gesture, (_d, e) => void playEffect(target, effect, effectOptions, e).catch(() => undefined), {
              velocity: this.num('velocity', 0.8),
              angle: this.num('angle', 30),
              duration: this.num('duration', 650),
            })
          );
        }
      },
    { id: 'usa-gesture-fx', text: 'usa-gesture-fx{display:inline-block;touch-action:none;user-select:none}' }
  );
}
