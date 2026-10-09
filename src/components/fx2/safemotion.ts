/**
 * 9.5 — Accessible motion 2.0 (`motionary/fx/safe`, also `motionary/components/fx-safe`):
 *
 * - `vestibularSafe(keyframes)` — strips movement (translate / scale /
 *   rotate / skew / perspective, clip and blur) from keyframes, keeping
 *   opacity and colour, so any animation can get a vestibular-safe twin.
 * - `flashCount(keyframes, duration)` / `isFlashSafe(...)` — counts large
 *   opacity / brightness swings and checks WCAG 2.3.1's three-flashes-per-
 *   second limit.
 * - `applyMotionPreferences(prefs)` / `loadMotionPreferences()` — the
 *   settings behind `<usa-motion-prefs>`: sensitivity level, speed (shared
 *   clock rate), pause autoplay, no parallax; persisted in localStorage and
 *   exposed as `data-usa-*` attributes on `<html>` for your CSS.
 *
 * Effects that never move anything: `safe-fade` (enter), `focus-glow`
 * (attention), `color-pulse` (attention), `underline-sweep` (hover).
 */
import type { EffectContext, EffectDefinition } from '../fx/registry';
import { registerEffects } from '../fx/registry';
import { configureComponents, setClock, type MotionSensitivity } from '../base';

const MOVE = /^(transform|translate|scale|rotate|offset|offsetPath|offsetDistance|clipPath|top|left|right|bottom|margin.*|perspective)$/;
/** Keyframes with all movement removed (opacity / colour / shadow kept; blur removed from filters) (9.5). */
export function vestibularSafe(frames: Keyframe[]): Keyframe[] {
  return frames.map((f) => {
    const o: Keyframe = {};
    for (const [k, v] of Object.entries(f)) {
      if (MOVE.test(k)) continue;
      if (k === 'filter' && typeof v === 'string') {
        const nf = v.replace(/blur\([^)]*\)/g, '').trim();
        if (nf) o.filter = nf;
        continue;
      }
      (o as any)[k] = v;
    }
    return o;
  });
}

const lum = (f: Keyframe): number => {
  let l = f.opacity != null ? Number(f.opacity) : 1;
  const m = typeof f.filter === 'string' ? f.filter.match(/brightness\(([\d.]+)\)/) : null;
  if (m) l *= Number(m[1]);
  return l;
};
/** Number of flashes (a ≥ 0.3 luminance swing that comes back) in one run of `frames` (9.5). */
export function flashCount(frames: Keyframe[]): number {
  const ls = frames.map(lum);
  let n = 0;
  let dir = 0;
  let ref = ls[0] ?? 1;
  for (const l of ls.slice(1)) {
    const d = l - ref;
    if (Math.abs(d) >= 0.3) {
      const s = Math.sign(d);
      if (dir && s !== dir) n++;
      dir = s;
      ref = l;
    }
  }
  return n;
}
/** WCAG 2.3.1: no more than three flashes in any one second (9.5). */
export function isFlashSafe(frames: Keyframe[], duration: number, iterations = 1): boolean {
  const per = flashCount(frames);
  if (!per) return true;
  const perSecond = (per * Math.max(1, Number.isFinite(iterations) ? iterations : 1)) / Math.max(0.001, (duration * Math.max(1, Number.isFinite(iterations) ? iterations : 1)) / 1000);
  return perSecond <= 3;
}

export interface MotionPreferences {
  sensitivity: MotionSensitivity;
  speed: number;
  pauseAutoplay: boolean;
  noParallax: boolean;
}
export const MOTION_PREFS_KEY = 'usa-motion-prefs';
export const DEFAULT_MOTION_PREFS: MotionPreferences = { sensitivity: 'full', speed: 1, pauseAutoplay: false, noParallax: false };

/** Apply (and persist) motion preferences: sensitivity, shared clock speed, `data-usa-*` flags on `<html>` (9.5). */
export function applyMotionPreferences(p: Partial<MotionPreferences>, persist = true): MotionPreferences {
  const prefs: MotionPreferences = { ...DEFAULT_MOTION_PREFS, ...p };
  if (!['full', 'gentle', 'minimal', 'static'].includes(prefs.sensitivity)) prefs.sensitivity = 'full';
  prefs.speed = Math.min(2, Math.max(0.25, Number(prefs.speed) || 1));
  configureComponents({ motionSensitivity: prefs.sensitivity });
  setClock({ rate: prefs.speed });
  if (typeof document !== 'undefined') {
    const h = document.documentElement;
    h.toggleAttribute('data-usa-pause-autoplay', prefs.pauseAutoplay);
    h.toggleAttribute('data-usa-no-parallax', prefs.noParallax);
    if (prefs.pauseAutoplay) document.querySelectorAll<HTMLMediaElement>('video[autoplay], audio[autoplay]').forEach((m) => m.pause?.());
  }
  if (persist)
    try {
      localStorage.setItem(MOTION_PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* storage blocked */
    }
  return prefs;
}
/** Saved preferences (or the defaults) (9.5). */
export function loadMotionPreferences(): MotionPreferences {
  try {
    const j = JSON.parse(localStorage.getItem(MOTION_PREFS_KEY) || 'null');
    if (j && typeof j === 'object') return { ...DEFAULT_MOTION_PREFS, ...j };
  } catch {
    /* none */
  }
  return { ...DEFAULT_MOTION_PREFS };
}

export const SAFE_FX: EffectDefinition[] = [
  {
    name: 'safe-fade',
    kind: 'enter',
    description: 'An entrance that never moves: opacity only (also used as the reduced-motion twin of other entrances).',
    defaults: { duration: 500 },
    reduced: 'run',
    run: (el: HTMLElement, o: any, ctx: EffectContext) => ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: o.duration, delay: o.delay, easing: 'ease-out', fill: 'backwards' })?.finished.catch(() => undefined),
  },
  {
    name: 'focus-glow',
    kind: 'attention',
    description: 'Draws attention with a pulsing focus-ring glow instead of movement (`color`).',
    defaults: { color: '#6366f1', duration: 1200 },
    reduced: 'run',
    run: (el: HTMLElement, o: any, ctx: EffectContext) => ctx.animate(el, [{ boxShadow: `0 0 0 0 ${o.color}00` }, { boxShadow: `0 0 0 4px ${o.color}`, offset: 0.4 }, { boxShadow: `0 0 0 8px ${o.color}00` }], { duration: o.duration })?.finished.catch(() => undefined),
  },
  {
    name: 'color-pulse',
    kind: 'attention',
    description: 'Draws attention with a colour change instead of movement (`color`).',
    defaults: { color: '#fde047', duration: 1000 },
    reduced: 'run',
    run: (el: HTMLElement, o: any, ctx: EffectContext) => ctx.animate(el, [{ backgroundColor: 'transparent' }, { backgroundColor: o.color, offset: 0.35 }, { backgroundColor: 'transparent' }], { duration: o.duration })?.finished.catch(() => undefined),
  },
  {
    name: 'underline-sweep',
    kind: 'hover',
    description: 'A text underline grows from the left on hover / focus — motion-light, no layout shift (`color`).',
    defaults: { color: 'currentColor', duration: 300 },
    reduced: 'run',
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      const prev = [el.style.backgroundImage, el.style.backgroundSize, el.style.backgroundRepeat, el.style.backgroundPosition];
      Object.assign(el.style, { backgroundImage: `linear-gradient(${o.color}, ${o.color})`, backgroundRepeat: 'no-repeat', backgroundPosition: '0 100%' });
      ctx.onCleanup(() => {
        [el.style.backgroundImage, el.style.backgroundSize, el.style.backgroundRepeat, el.style.backgroundPosition] = prev;
      });
      if (ctx.reduced) {
        el.style.backgroundSize = '100% 2px';
        return;
      }
      return ctx.animate(el, [{ backgroundSize: '0% 2px' }, { backgroundSize: '100% 2px' }], { duration: o.duration, easing: 'ease-out', fill: 'forwards' })?.finished.catch(() => undefined);
    },
  },
];

/** Register safe-fade, focus-glow, color-pulse and underline-sweep (9.5). */
export function registerSafePack(): void {
  registerEffects(SAFE_FX);
}
