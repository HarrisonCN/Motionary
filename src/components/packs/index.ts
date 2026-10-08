/**
 * use-scroll-animate/components/packs — effect packs (v3.9).
 * Ready-made motion for e-commerce, portfolio, dashboard, game UI and
 * landing pages: mark elements with `data-role` and apply a pack with
 * `<usa-pack name="…">` or `applyPack(name, root)`. Includes `flyToCart()`
 * and `countUp()`.
 */
import { definePack, type UsaPackElement } from './pack-el';

export { definePack };
export { applyPack, flyToCart, countUp, PACKS, PACK_PRIMITIVES } from './core';
export type { PackName, PackContext } from './core';
export type { UsaPackElement };

/** Register every component of this category under its default tag. */
export function definePacksComponents(): void {
  definePack();
}

declare global {
  interface HTMLElementTagNameMap {
    'usa-pack': UsaPackElement;
  }
}
