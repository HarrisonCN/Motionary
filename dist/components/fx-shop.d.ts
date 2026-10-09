type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
type Cleanup = () => void;

/**
 * 5.0 — unified plugin-style effect registration. Every effect (built-in or
 * yours) is a plain object registered once and played the same way:
 * `playEffect(el, name)`, `bindEffect(el, name, { trigger })` or
 * `<usa-fx effect="name" trigger="click">`. Effects get a context that
 * already applies reduced motion, motion sensitivity, intensity and the
 * animation budget.
 */

declare const EFFECT_KINDS: readonly ["enter", "exit", "attention", "click", "hover", "card", "loop", "page", "background", "text", "cursor", "scroll"];
type EffectKind = (typeof EFFECT_KINDS)[number];
interface EffectContext {
    /** Reduced motion applies (OS setting, `minimal` / `static` sensitivity). */
    readonly reduced: boolean;
    readonly sensitivity: MotionSensitivity;
    /** The triggering event (pointer position for click effects), if any. */
    readonly event?: Event;
    /** `el.animate()` with the library's motion rules (may return `null`). */
    animate(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation | null;
    /** Register teardown for long-running effects (loops, listeners). */
    onCleanup(fn: Cleanup): void;
}
interface EffectDefinition<O extends Record<string, unknown> = Record<string, any>> {
    /** Unique, kebab-case. */
    name: string;
    kind: EffectKind;
    /** One line for docs and the gallery. */
    description?: string;
    /** Option defaults (merged under the caller's options). */
    defaults?: Partial<O>;
    /**
     * Under reduced motion: `'skip'` (do nothing — default for loop, background
     * and cursor effects) or `'run'` (run with `ctx.reduced === true`, the
     * effect degrades itself — default for everything else).
     */
    reduced?: 'skip' | 'run';
    /** Play the effect. Return an Animation / Promise to be awaited, or a cleanup. */
    run(el: HTMLElement, options: O, ctx: EffectContext): void | Cleanup | Animation | null | Promise<unknown>;
}

/**
 * 7.3 — E-commerce motion (`motionary/fx/shop`, also
 * `motionary/components/fx-shop`):
 *
 * - `fly-to-cart` (click) — a ghost of the element (or its first `img`) flies
 *   on an arc into the cart (`to`, default `[data-cart]`), shrinking; the cart
 *   bumps when it lands.
 * - `price-flip` (enter) — the price flips like a split-flap display from
 *   `data-from` (or a scramble) to its text.
 * - `stock-pulse` (loop) — a soft urgency pulse (glow ring) for low stock.
 * - `sale-shine` (hover) — a diagonal light sweep across the element.
 * - `badge-pop` (attention) — a sale badge pops in with a wobble.
 *
 * Reduced motion: fly-to-cart only bumps the cart with a fade, price-flip
 * sets the text, stock-pulse and sale-shine do nothing, badge-pop fades.
 */

/** Quadratic-bezier arc points from a to b, lifted by `lift` px (7.3). */
declare function arcPath(ax: number, ay: number, bx: number, by: number, lift?: number, steps?: number): {
    x: number;
    y: number;
}[];
declare const SHOP_FX: EffectDefinition[];
/** Register the 7.3 e-commerce pack (idempotent). */
declare function registerShopPack(): void;

export { SHOP_FX, arcPath, registerShopPack };
