/**
 * `motionary/runtime` (10.1) — Motionary's own zero-dependency animation
 * runtime, the one prerequisite for runtime-powered components:
 *
 * - shared **ticker** (`getTicker()`): one rAF loop for everything;
 * - **tween + timeline** engine with easing (`tween()`, `timeline()`, `EASES`, `cubicBezier()`);
 * - **module registry** (`use()`, `requireModule()`, `hasModule()`) with a
 *   clear `RuntimeModuleError` (install / import / CDN instructions) when a
 *   component needs a module that was not registered.
 *
 * Every other module lives at its own subpath (`motionary/runtime/format-css`,
 * `motionary/runtime/format-motion`, …) so you only pay for what you import.
 * SSR-safe (no `window` access at import) and usable in Web Workers.
 *
 * ```ts
 * import { use, tween } from 'motionary/runtime';
 * use();                                   // registers the core (components can now find it)
 * tween('.box', { to: { x: 120, opacity: 1 }, duration: 500, ease: 'back-out' });
 * ```
 */
import { register, RUNTIME_VERSION, type RuntimeModule, type RuntimeRegistry } from './registry';
import { getTicker } from './ticker';
import { tween as rawTween, timeline, Tween, Timeline, type TweenOptions, type Playable } from './tween';
import { EASES, parseEase, cubicBezier, steps } from './ease';

export { registry, register, requireModule, hasModule, registeredModules, missingMessage, modulePath, moduleCdn, RuntimeModuleError, RUNTIME_VERSION, RUNTIME_CDN } from './registry';
export { RUNTIME_TIERS, TIER_ORDER, tierOf, maxTier } from './registry';
export type { RuntimeModule, RuntimeRegistry, RuntimeTier } from './registry';
export { getTicker } from './ticker';
export type { Ticker, TickFn } from './ticker';
export { timeline, Tween, Timeline, Playable, parseValue } from './tween';
export type { TweenOptions, TimelineOptions, PlayOptions, Props, Target, Position } from './tween';
export { EASES, parseEase, cubicBezier, steps } from './ease';
export type { Ease } from './ease';

/** The core module's API (what `requireModule('core')` returns). */
export interface CoreApi {
  version: string;
  getTicker: typeof getTicker;
  tween: (target: any, o: import('./tween').TweenOptions) => import('./tween').Playable;
  timeline: typeof timeline;
  Tween: typeof Tween;
  Timeline: typeof Timeline;
  EASES: typeof EASES;
  parseEase: typeof parseEase;
  cubicBezier: typeof cubicBezier;
  steps: typeof steps;
}

/** The core as a module object. */
export const core: RuntimeModule<CoreApi> = {
  id: 'core',
  version: RUNTIME_VERSION,
  tier: 'basic',
  api: { version: RUNTIME_VERSION, getTicker, tween, timeline, Tween, Timeline, EASES, parseEase, cubicBezier, steps },
};

/** Tween targets (objects, elements, lists or a CSS selector). See `TweenOptions`. */
export function tween(target: any, o: TweenOptions): Playable {
  return rawTween(resolveTargets(target), o);
}

/** Selector strings become element lists (only where `document` exists). */
export function resolveTargets(t: any): any {
  if (typeof t === 'string') {
    if (typeof document === 'undefined') throw new Error('[motionary] selector targets need a document — pass objects or elements instead');
    return Array.from(document.querySelectorAll(t));
  }
  return t;
}

/**
 * Register the core plus any modules (`use(formatCss, formatMotion)`).
 * Call once at start-up, before runtime-powered components mount.
 */
export function use(...mods: RuntimeModule[]): RuntimeRegistry {
  return register(core as RuntimeModule, ...mods);
}
