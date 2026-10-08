/**
 * use-scroll-animate/components — shared base for the `<usa-*>` custom elements.
 *
 * Everything here is lazy: nothing touches `window`, `document`,
 * `HTMLElement` or `matchMedia` at import time, so the components can be
 * imported during SSR (Next, Nuxt, Astro…) and in Electron/Tauri preload
 * scripts. Classes are created the first time a `define*()` function runs.
 */
interface ComponentsConfig {
    /**
     * Inject each component's CSS when it is defined (default `true`). Uses a
     * constructable stylesheet (`document.adoptedStyleSheets`, which a strict
     * `style-src` CSP does not block) and falls back to a `<style>` tag. Set
     * to `false` when you load `use-scroll-animate/components.css` yourself.
     */
    injectStyles?: boolean;
    /**
     * `'user'` (default) follows `prefers-reduced-motion`; `'reduce'` always
     * uses the reduced variants (e.g. a kiosk / battery-saver mode);
     * `'no-preference'` ignores the OS setting (only for demos — respect your users).
     */
    reducedMotion?: 'user' | 'reduce' | 'no-preference';
    /**
     * Global motion intensity (v2.7): `'off'` (same as reduced motion),
     * `'low'` (shorter, calmer), `'normal'` (default) or `'high'`. Scales every
     * component animation's duration and sets `--usa-motion` (0 / 0.6 / 1 /
     * 1.25) on `<html>` for your own CSS. See `setMotionIntensity()`.
     */
    motionIntensity?: MotionIntensity;
    /**
     * Motion-sensitivity level (v4.4), finer than reduced motion:
     * `'full'` (default) · `'gentle'` (no spins, zooms, skews or parallax —
     * translations and fades only, safe for vestibular disorders) ·
     * `'minimal'` (fades only; components use their reduced-motion variants) ·
     * `'static'` (no animation: every component shows its static alternative).
     * See `setMotionSensitivity()` in `use-scroll-animate/components/a11y`.
     */
    motionSensitivity?: MotionSensitivity;
}
type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
type MotionIntensity = 'off' | 'low' | 'normal' | 'high';
/** Change global component settings (call before `define*()` for `injectStyles`). */
declare function configureComponents(options: ComponentsConfig): void;
/** `true` when animations should be reduced (OS setting or `configureComponents`). */
declare function prefersReducedMotion(): boolean;
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
 * use-scroll-animate/components/packs — effect packs (v3.9).
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

export { PACKS, PACK_PRIMITIVES, applyPack, configureComponents, countUp, definePack, definePacksComponents, flyToCart, prefersReducedMotion };
export type { ComponentsConfig, PackContext, PackName, UsaElement, UsaPackElement };
