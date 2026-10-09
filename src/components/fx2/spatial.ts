/**
 * 8.8 — XR / spatial pack (`motionary/fx/spatial`, also `motionary/components/fx-spatial`):
 *
 * - `portal-open` (enter) — the element opens like a portal: a ring of
 *   light expands and the content comes through from depth (`color`).
 * - `orbit-in` (enter) — the element swings in around the vertical axis
 *   like a spatial window placed beside you (`from` left|right).
 * - `spatial-float` (loop) — a gentle floating in depth with a breathing
 *   shadow; the cleanup stops it.
 * - `depth-pop` (attention) — the element pops forward towards the viewer
 *   and settles back.
 *
 * Reduced motion: portal-open / orbit-in just show, spatial-float is
 * skipped, depth-pop does nothing.
 */
import type { EffectContext, EffectDefinition } from '../fx/registry';
import { registerEffects } from '../fx/registry';

/** Horizontal background offset (px) of a 360° panorama `width` px wide for a `yaw` in degrees (wraps) (8.8). */
export function yawToOffset(yaw: number, width: number): number {
  if (!width) return 0;
  const y = ((yaw % 360) + 360) % 360;
  return -Math.round((y / 360) * width * 100) / 100;
}

/** Which WebXR session the browser offers: `'immersive-vr'`, `'immersive-ar'`, `'inline'` or `'none'` (8.8). */
export async function xrSupport(): Promise<'immersive-vr' | 'immersive-ar' | 'inline' | 'none'> {
  const xr = typeof navigator !== 'undefined' ? (navigator as any).xr : undefined;
  if (!xr?.isSessionSupported) return 'none';
  for (const m of ['immersive-vr', 'immersive-ar', 'inline'] as const) {
    try {
      if (await xr.isSessionSupported(m)) return m;
    } catch {
      /* blocked by policy */
    }
  }
  return 'none';
}

export const SPATIAL_FX: EffectDefinition[] = [
  {
    name: 'portal-open',
    kind: 'enter',
    description: 'The element opens like a portal: a ring of light expands and the content comes through from depth (`color`).',
    defaults: { color: '#a78bfa', duration: 1100 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      if (getComputedStyle(el).position === 'static') {
        const prev = el.style.position;
        el.style.position = 'relative';
        ctx.onCleanup(() => (el.style.position = prev));
      }
      const ring = document.createElement('span');
      ring.setAttribute('aria-hidden', 'true');
      Object.assign(ring.style, { position: 'absolute', left: '50%', top: '50%', width: '20px', height: '20px', margin: '-10px 0 0 -10px', borderRadius: '50%', border: `3px solid ${o.color}`, boxShadow: `0 0 18px 4px ${o.color}, inset 0 0 12px ${o.color}`, pointerEvents: 'none' });
      el.appendChild(ring);
      ctx.onCleanup(() => ring.remove());
      const big = Math.max(el.offsetWidth, el.offsetHeight, 80) / 10;
      const a = ctx.animate(ring, [{ transform: 'scale(0)', opacity: 1 }, { transform: `scale(${big})`, opacity: 0.9, offset: 0.6 }, { transform: `scale(${big * 1.2})`, opacity: 0 }], { duration: o.duration, easing: 'cubic-bezier(.2,.8,.2,1)' });
      const b = ctx.animate(el, [{ clipPath: 'circle(0% at 50% 50%)', transform: 'perspective(700px) translateZ(-200px)' }, { clipPath: 'circle(75% at 50% 50%)', transform: 'none' }], { duration: o.duration, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      const end = () => ring.remove();
      return Promise.all([a?.finished.catch(() => undefined), b?.finished.catch(() => undefined)]).then(end, end);
    },
  },
  {
    name: 'orbit-in',
    kind: 'enter',
    description: 'The element swings in around the vertical axis like a spatial window placed beside you (`from`).',
    defaults: { from: 'left', duration: 900 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      const s = o.from === 'right' ? 1 : -1;
      return ctx.animate(el, [{ transform: `perspective(900px) translateX(${s * 60}%) rotateY(${-s * 70}deg) translateZ(-120px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: o.duration, easing: 'cubic-bezier(.2,.9,.25,1)', fill: 'backwards' })?.finished.catch(() => undefined);
    },
  },
  {
    name: 'spatial-float',
    kind: 'loop',
    description: 'A gentle floating in depth with a breathing shadow, until the cleanup runs.',
    defaults: { duration: 4200 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      const a = ctx.animate(el, [{ transform: 'perspective(800px) translateZ(0) translateY(0)', boxShadow: '0 14px 30px -18px rgba(15,23,42,.5)' }, { transform: 'perspective(800px) translateZ(24px) translateY(-6px)', boxShadow: '0 30px 50px -22px rgba(15,23,42,.45)' }, { transform: 'perspective(800px) translateZ(0) translateY(0)', boxShadow: '0 14px 30px -18px rgba(15,23,42,.5)' }], { duration: o.duration, iterations: Infinity, easing: 'ease-in-out' });
      return () => a?.cancel();
    },
  },
  {
    name: 'depth-pop',
    kind: 'attention',
    description: 'The element pops forward towards the viewer and settles back.',
    defaults: { duration: 600 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      return ctx.animate(el, [{ transform: 'perspective(700px) translateZ(0)' }, { transform: 'perspective(700px) translateZ(90px)', filter: 'brightness(1.1)', offset: 0.35 }, { transform: 'perspective(700px) translateZ(-10px)', offset: 0.7 }, { transform: 'perspective(700px) translateZ(0)' }], { duration: o.duration, easing: 'ease-out' })?.finished.catch(() => undefined);
    },
  },
];

/** Register portal-open, orbit-in, spatial-float and depth-pop (8.8). */
export function registerSpatialPack(): void {
  registerEffects(SPATIAL_FX);
}
