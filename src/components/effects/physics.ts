/**
 * 5.2 — bounce & physics micro-interactions, registered through
 * `registerEffect()`. Keyframes come from a damped-spring / gravity solver
 * (`springKeyframes()`, `bounceKeyframes()`), so the motion is physical but
 * still runs on the Web Animations API (compositor, reduced-motion aware).
 * Effects: `bounce-in`, `rubber-band`, `elastic-hover`, `drop-bounce`,
 * `gravity-text`, `spring-follow`, `bell-swing`.
 */
import type { EffectDefinition } from '../fx/registry';
import { all } from './shared';

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  /** Samples (keyframes). */
  steps?: number;
}

/**
 * Sample a damped spring from 0 → 1 and return the progress values plus the
 * time (ms) it takes to settle. Pure, deterministic.
 */
export function solveSpring({ stiffness = 180, damping = 12, mass = 1, steps = 40 }: SpringOptions = {}): { values: number[]; duration: number } {
  const dt = 1 / 120;
  let x = 0;
  let v = 0;
  const trace: number[] = [];
  let t = 0;
  for (; t < 4; t += dt) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    trace.push(x);
    if (t > 0.1 && Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) break;
  }
  const values = Array.from({ length: steps + 1 }, (_, i) => +trace[Math.min(trace.length - 1, Math.round((i / steps) * (trace.length - 1)))].toFixed(4));
  values[0] = 0;
  values[steps] = 1;
  return { values, duration: Math.round(trace.length * dt * 1000) };
}

/** Keyframes for a property driven by a spring: `map(progress)` → keyframe. */
export function springKeyframes(map: (p: number) => Keyframe, spring?: SpringOptions): { frames: Keyframe[]; duration: number } {
  const { values, duration } = solveSpring(spring);
  return { frames: values.map(map), duration };
}

/** Height (0 = floor, 1 = drop height) of a ball dropped with restitution `bounce`, sampled `steps` times. */
export function bounceKeyframes(bounce = 0.5, steps = 48): number[] {
  // segment durations scale with sqrt(height); heights scale with bounce^2 per hop
  const hops: number[] = [1];
  let h = 1;
  while (hops.length < 6 && h > 0.01) {
    h *= bounce * bounce;
    hops.push(h);
  }
  const segT = hops.map((hh, i) => (i === 0 ? Math.sqrt(hh) : 2 * Math.sqrt(hh)));
  const total = segT.reduce((a, b) => a + b, 0);
  return Array.from({ length: steps + 1 }, (_, i) => {
    let t = (i / steps) * total;
    for (let k = 0; k < hops.length; k++) {
      if (t <= segT[k] || k === hops.length - 1) {
        const tt = Math.min(t, segT[k]);
        if (k === 0) return +(1 - (tt / segT[0]) ** 2).toFixed(4);
        const half = segT[k] / 2;
        return +(hops[k] * (1 - ((tt - half) / half) ** 2)).toFixed(4);
      }
      t -= segT[k];
    }
    return 0;
  });
}

const fade = (el: HTMLElement, ctx: Parameters<EffectDefinition['run']>[2]) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 });

export const PHYSICS_FX: EffectDefinition[] = [
  {
    name: 'bounce-in',
    kind: 'enter',
    description: 'Springs in from small with an overshoot (spring solver; stiffness / damping options).',
    defaults: { stiffness: 220, damping: 11, from: 0.3 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return fade(el, ctx);
      const { frames, duration } = springKeyframes((p) => ({ transform: `scale(${(o.from + (1 - o.from) * p).toFixed(4)})`, opacity: Math.min(1, p * 3) }), o);
      return ctx.animate(el, frames, { duration, easing: 'linear' });
    },
  },
  {
    name: 'rubber-band',
    kind: 'attention',
    description: 'Stretches wide, snaps back thin and settles like a rubber band.',
    defaults: { duration: 900, amount: 0.25 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      const a = o.amount;
      return ctx.animate(el, [{ transform: 'scale(1,1)' }, { transform: `scale(${1 + a},${1 - a})`, offset: 0.3 }, { transform: `scale(${1 - a},${1 + a})`, offset: 0.4 }, { transform: `scale(${1 + a / 2},${1 - a / 2})`, offset: 0.5 }, { transform: `scale(${1 - a / 5},${1 + a / 5})`, offset: 0.65 }, { transform: `scale(${1 + a / 10},${1 - a / 10})`, offset: 0.75 }, { transform: 'scale(1,1)' }], { duration: o.duration });
    },
  },
  {
    name: 'elastic-hover',
    kind: 'hover',
    description: 'Hover lifts with a springy overshoot; leaving springs back (persistent; trigger="load").',
    defaults: { lift: 6, scale: 1.04, stiffness: 260, damping: 10 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      const to = (on: boolean) => {
        const from = on ? 0 : 1;
        const { frames, duration } = springKeyframes((p) => {
          const k = from + (on ? p : -p);
          return { transform: `translateY(${(-o.lift * k).toFixed(2)}px) scale(${(1 + (o.scale - 1) * k).toFixed(4)})` };
        }, o);
        ctx.animate(el, frames, { duration, fill: 'forwards', easing: 'linear' });
      };
      const enter = () => to(true);
      const leave = () => to(false);
      el.addEventListener('pointerenter', enter);
      el.addEventListener('pointerleave', leave);
      return () => {
        el.removeEventListener('pointerenter', enter);
        el.removeEventListener('pointerleave', leave);
      };
    },
  },
  {
    name: 'drop-bounce',
    kind: 'enter',
    description: 'Falls in under gravity and bounces to rest (`height`, `bounce` restitution 0–0.9).',
    defaults: { height: 120, bounce: 0.5, duration: 1100 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return fade(el, ctx);
      const hs = bounceKeyframes(Math.min(0.9, Math.max(0, o.bounce)));
      return ctx.animate(el, hs.map((h, i) => ({ transform: `translateY(${(-h * o.height).toFixed(1)}px)`, opacity: i === 0 ? 0 : 1 })), { duration: o.duration, easing: 'linear' });
    },
  },
  {
    name: 'gravity-text',
    kind: 'text',
    description: 'Each character drops in under gravity with a bounce, staggered (splits the text into aria-hidden spans; the label stays readable).',
    defaults: { height: 60, bounce: 0.45, duration: 900, stagger: 45 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      if (!el.dataset.usaSplit) {
        const text = el.textContent || '';
        el.setAttribute('aria-label', text);
        el.textContent = '';
        for (const ch of Array.from(text)) {
          const s = document.createElement('span');
          s.setAttribute('aria-hidden', 'true');
          s.style.display = 'inline-block';
          s.style.whiteSpace = 'pre';
          s.textContent = ch;
          el.appendChild(s);
        }
        el.dataset.usaSplit = '1';
      }
      const hs = bounceKeyframes(o.bounce, 32);
      return all((Array.from(el.children) as HTMLElement[]).map((s, i) => ctx.animate(s, hs.map((h) => ({ transform: `translateY(${(-h * o.height).toFixed(1)}px)` })), { duration: o.duration, delay: i * o.stagger, easing: 'linear', fill: 'backwards' })));
    },
  },
  {
    name: 'spring-follow',
    kind: 'cursor',
    description: 'The element springs toward the pointer while it moves over its parent, and back home on leave (persistent).',
    defaults: { stiffness: 0.12, damping: 0.75, range: 40 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      const host = el.parentElement || el;
      let tx = 0;
      let ty = 0;
      let x = 0;
      let y = 0;
      let vx = 0;
      let vy = 0;
      let raf = 0;
      const tick = () => {
        vx = (vx + (tx - x) * o.stiffness) * o.damping;
        vy = (vy + (ty - y) * o.stiffness) * o.damping;
        x += vx;
        y += vy;
        el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
        raf = Math.abs(vx) + Math.abs(vy) + Math.abs(tx - x) + Math.abs(ty - y) > 0.05 ? requestAnimationFrame(tick) : 0;
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(tick);
      };
      const move = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        const nx = (e.clientX - r.left) / (r.width || 1) - 0.5;
        const ny = (e.clientY - r.top) / (r.height || 1) - 0.5;
        tx = nx * 2 * o.range;
        ty = ny * 2 * o.range;
        kick();
      };
      const leave = () => {
        tx = ty = 0;
        kick();
      };
      host.addEventListener('pointermove', move);
      host.addEventListener('pointerleave', leave);
      return () => {
        host.removeEventListener('pointermove', move);
        host.removeEventListener('pointerleave', leave);
        cancelAnimationFrame(raf);
        el.style.translate = '';
      };
    },
  },
  {
    name: 'bell-swing',
    kind: 'attention',
    description: 'Swings from its top like a ringing bell with damped oscillation.',
    defaults: { angle: 22, stiffness: 120, damping: 4 },
    run: (el, o: any, ctx) => {
      if (ctx.reduced) return;
      el.style.transformOrigin = 'top center';
      const { frames, duration } = springKeyframes((p) => ({ transform: `rotate(${(o.angle * (1 - p)).toFixed(2)}deg)` }), { stiffness: o.stiffness, damping: o.damping, steps: 48 });
      frames[0] = { transform: 'rotate(0deg)' };
      return ctx.animate(el, frames, { duration: Math.min(duration, 2400), easing: 'linear' });
    },
  },
];
