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

export { CARD_FX, CLICK_FX };
export { fxLayer } from './shared';

/** The effect packs by version, in release order. */
export const EFFECT_PACKS: Record<string, EffectDefinition[]> = {
  'cards-click': [...CARD_FX, ...CLICK_FX],
};

/** 5.1: card & click effects 2.0. */
export function registerCardClickEffects(): void {
  registerEffects(EFFECT_PACKS['cards-click']);
}

/** Register the built-ins and every pack (idempotent). */
export function registerAllEffects(): void {
  registerBuiltinEffects();
  for (const defs of Object.values(EFFECT_PACKS)) registerEffects(defs);
}
