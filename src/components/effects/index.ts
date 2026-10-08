/**
 * use-scroll-animate/components/effects — the 5.x effect packs, all
 * registered through `registerEffect()` (5.0) and playable with
 * `playEffect()`, `bindEffect()` or `<usa-fx>`. Kept out of
 * `use-scroll-animate/components` / `components/lite` so their size budgets
 * hold; the UMD bundle registers everything.
 *
 * ```ts
 * import { registerAllEffects } from 'use-scroll-animate/components/effects';
 * registerAllEffects();
 * ```
 */
import { registerEffects, registerBuiltinEffects } from '../fx/index';
import type { EffectDefinition } from '../fx/registry';
import { CARD_FX, CLICK_FX } from './cards-click';
import { PHYSICS_FX } from './physics';

export { CARD_FX, CLICK_FX, PHYSICS_FX };
export { solveSpring, springKeyframes, bounceKeyframes } from './physics';
export type { SpringOptions } from './physics';
export { fxLayer } from './shared';

/** The effect packs by version, in release order. */
export const EFFECT_PACKS: Record<string, EffectDefinition[]> = {
  'cards-click': [...CARD_FX, ...CLICK_FX],
  physics: PHYSICS_FX,
};

/** 5.1: card & click effects 2.0. */
export function registerCardClickEffects(): void {
  registerEffects(EFFECT_PACKS['cards-click']);
}

/** 5.2: bounce & physics micro-interactions. */
export function registerPhysicsEffects(): void {
  registerEffects(EFFECT_PACKS.physics);
}

/** Register the built-ins and every pack (idempotent). */
export function registerAllEffects(): void {
  registerBuiltinEffects();
  for (const defs of Object.values(EFFECT_PACKS)) registerEffects(defs);
}
