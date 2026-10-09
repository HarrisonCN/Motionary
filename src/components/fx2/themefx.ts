/**
 * 8.6 — Surface theme pack (`motionary/fx/surface`, also `motionary/components/fx-surface`):
 *
 * - `neon-ignite` (enter) — the element powers on like a neon tube: a few
 *   stuttering flickers, then a steady glow (`color`).
 * - `neon-pulse` (loop) — a slow breathing neon glow; the cleanup stops it
 *   (`color`).
 * - `glass-frost` (enter) — frosted glass condenses: blur and transparency
 *   settle into a crisp glass panel, with a shine passing over it.
 * - `neu-press` (attention) — a soft neumorphic press: the raised shadow
 *   flips to an inset one and pops back.
 *
 * Reduced motion: neon-ignite / glass-frost just show, neon-pulse is
 * skipped, neu-press does nothing.
 */
import type { EffectContext, EffectDefinition } from '../fx/registry';
import { registerEffects } from '../fx/registry';

/** The built-in surface themes of the 8.6 theme system. */
export const SURFACE_THEMES = ['light', 'dark', 'neon', 'glass', 'neu'] as const;
export type SurfaceTheme = (typeof SURFACE_THEMES)[number];

/** Set `data-usa-surface` on `target` (default `<html>`) and return the theme actually applied (unknown → `light`) (8.6). */
export function applySurfaceTheme(name: string, target: Element | null = typeof document !== 'undefined' ? document.documentElement : null): SurfaceTheme {
  const t = ((SURFACE_THEMES as readonly string[]).includes(name) ? name : 'light') as SurfaceTheme;
  target?.setAttribute('data-usa-surface', t);
  return t;
}

const glow = (c: string, k: number) => `0 0 ${4 * k}px ${c}, 0 0 ${12 * k}px ${c}`;

export const SURFACE_FX: EffectDefinition[] = [
  {
    name: 'neon-ignite',
    kind: 'enter',
    description: 'The element powers on like a neon tube — stuttering flickers, then a steady glow (`color`).',
    defaults: { color: '#f0abfc', duration: 1100 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      const on = { opacity: 1, textShadow: glow(o.color, 1), filter: 'brightness(1.15)' };
      const off = { opacity: 0.15, textShadow: 'none', filter: 'brightness(.6)' };
      return ctx.animate(el, [{ ...off, offset: 0 }, { ...on, offset: 0.1 }, { ...off, offset: 0.14 }, { ...on, offset: 0.3 }, { ...off, offset: 0.34 }, { ...off, offset: 0.5 }, { ...on, offset: 0.56 }, { ...on, textShadow: glow(o.color, 1.6), offset: 0.8 }, { opacity: 1, textShadow: glow(o.color, 1), filter: 'none', offset: 1 }], { duration: o.duration, fill: 'backwards' })?.finished.catch(() => undefined);
    },
  },
  {
    name: 'neon-pulse',
    kind: 'loop',
    description: 'A slow breathing neon glow until the cleanup runs (`color`).',
    defaults: { color: '#22d3ee', duration: 2200 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      const a = ctx.animate(el, [{ boxShadow: glow(o.color, 0.6) }, { boxShadow: glow(o.color, 1.6) }, { boxShadow: glow(o.color, 0.6) }], { duration: o.duration, iterations: Infinity, easing: 'ease-in-out' });
      return () => a?.cancel();
    },
  },
  {
    name: 'glass-frost',
    kind: 'enter',
    description: 'Frosted glass condenses: blur and transparency settle into a crisp glass panel, with a shine passing over it.',
    defaults: { duration: 1000 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      const runs: (Promise<unknown> | undefined)[] = [];
      runs.push(ctx.animate(el, [{ opacity: 0, filter: 'blur(12px)', transform: 'scale(.96)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: o.duration, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' })?.finished.catch(() => undefined));
      if (getComputedStyle(el).position === 'static') {
        const prev = el.style.position;
        el.style.position = 'relative';
        ctx.onCleanup(() => (el.style.position = prev));
      }
      const s = document.createElement('span');
      s.setAttribute('aria-hidden', 'true');
      Object.assign(s.style, { position: 'absolute', inset: '0', pointerEvents: 'none', borderRadius: 'inherit', background: 'linear-gradient(110deg,transparent 30%,rgba(255,255,255,.55) 50%,transparent 70%)', backgroundSize: '250% 100%' });
      el.appendChild(s);
      ctx.onCleanup(() => s.remove());
      const sh = ctx.animate(s, [{ backgroundPosition: '120% 0' }, { backgroundPosition: '-60% 0' }], { duration: o.duration * 0.9, delay: o.duration * 0.4, easing: 'ease-in-out', fill: 'backwards' });
      runs.push(sh ? sh.finished.then(() => s.remove(), () => s.remove()) : (s.remove(), undefined));
      return Promise.all(runs).then(() => undefined);
    },
  },
  {
    name: 'neu-press',
    kind: 'attention',
    description: 'A soft neumorphic press: the raised shadow flips to an inset one and pops back.',
    defaults: { duration: 450 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      const up = '6px 6px 12px rgba(163,177,198,.7), -6px -6px 12px rgba(255,255,255,.9)';
      const down = 'inset 4px 4px 8px rgba(163,177,198,.8), inset -4px -4px 8px rgba(255,255,255,.9)';
      return ctx.animate(el, [{ boxShadow: up, transform: 'none' }, { boxShadow: down, transform: 'scale(.97)', offset: 0.4 }, { boxShadow: up, transform: 'none' }], { duration: o.duration, easing: 'ease-out' })?.finished.catch(() => undefined);
    },
  },
];

/** Register neon-ignite, neon-pulse, glass-frost and neu-press (8.6). */
export function registerSurfacePack(): void {
  registerEffects(SURFACE_FX);
}
