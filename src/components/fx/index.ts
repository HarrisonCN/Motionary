/**
 * use-scroll-animate/components/fx — unified plugin-style effects (5.0).
 * `registerEffect({ name, kind, run })`, `playEffect(el, name)`,
 * `bindEffect(el, name, { trigger })`, `<usa-fx effect trigger>`. Built-ins:
 * every timeline preset (`enter`), `pulse` · `pop` · `jelly` · `wiggle` ·
 * `heartbeat` · `bounce` · `flash` · `tada` · `shake` (attention),
 * `burst` · `confetti` · `ripple` (click). More packs: `use-scroll-animate/components/effects`.
 */
import { defineFx, type UsaFxElement } from './fx-el';
import { registerEffects } from './registry';
import { BUILTIN_EFFECTS } from './builtins';

export { defineFx };
export { registerEffect, registerEffects, playEffect, bindEffect, getEffect, hasEffect, listEffects, EFFECT_KINDS, EFFECT_TRIGGERS } from './registry';
export type { EffectDefinition, EffectContext, EffectKind, EffectTrigger } from './registry';
export { BUILTIN_EFFECTS };
export type { UsaFxElement };

/** Register the built-in effects (idempotent; `defineFxComponents()` calls it). */
export function registerBuiltinEffects(): void {
  registerEffects(BUILTIN_EFFECTS);
}

/** Register every component of this category under its default tag (+ the built-in effects). */
export function defineFxComponents(): void {
  registerBuiltinEffects();
  defineFx();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-fx': UsaFxElement;
  }
}
