/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
}

/**
 * `<usa-pack name="ecommerce">` — applies an effect pack (`ecommerce` ·
 * `portfolio` · `dashboard` · `game` · `landing`) to its subtree:
 * descendants opt in with `data-role` (see `PACKS`). Re-applies when
 * `name` changes; undone on disconnect.
 */
interface UsaPackElement extends UsaElement {
    readonly roles: string[];
}
declare function definePack(tag?: string): CustomElementConstructor | undefined;

type Cleanup = () => void;
interface PackContext {
    root: HTMLElement;
    /** Index of the element among those with the same role (for staggering). */
    index: number;
    reduced: boolean;
}
/** Count `el`'s number up from 0 when it enters the view (keeps prefix / suffix / decimals). */
declare function countUp(el: HTMLElement, duration?: number): Cleanup;
/**
 * Fly a copy of `from` (e.g. a product image) into `to` (the cart icon) along
 * an arc, then bump the target. Resolves when it lands. Instant under
 * reduced motion (only the bump's state change, no flight).
 */
declare function flyToCart(from: Element, to: Element, o?: {
    duration?: number;
}): Promise<void>;
/** The five effect packs: `data-role` → primitives. */
declare const PACKS: Record<string, Record<string, string[]>>;
type PackName = keyof typeof PACKS;
/**
 * Apply an effect pack to `root`: every descendant with a `data-role` the
 * pack knows gets its effects (staggered by index). Returns an undo function.
 * Reduced motion: only non-motion behaviour (e.g. the cart event) remains.
 *
 * @example
 * applyPack('ecommerce', document.querySelector('main'));
 * // <article data-role="product">… <button data-role="add-to-cart"> … <a data-role="cart">
 */
declare function applyPack(name: PackName | string, root?: HTMLElement | Document): Cleanup;
/** Primitive names a pack uses (for docs / tooling). */
declare const PACK_PRIMITIVES: string[];

/**
 * motionary/components/packs — effect packs (v3.9).
 * Ready-made motion for e-commerce, portfolio, dashboard, game UI and
 * landing pages: mark elements with `data-role` and apply a pack with
 * `<usa-pack name="…">` or `applyPack(name, root)`. Includes `flyToCart()`
 * and `countUp()`.
 */

/** Register every component of this category under its default tag. */
declare function definePacksComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-pack': UsaPackElement;
    }
}

export { PACKS, PACK_PRIMITIVES, applyPack, countUp, definePack, definePacksComponents, flyToCart };
export type { PackContext, PackName, UsaPackElement };
