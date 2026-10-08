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
 * 6.4 — Light & materials (`motionary/components/fx-light`), registered
 * through `registerEffect()`. Persistent effects (use `trigger="load"`)
 * that return a cleanup:
 *
 * - `light-follow` (hover) — a soft point light + specular highlight that
 *   follows the pointer over the surface.
 * - `refraction` (hover) — a glass lens that bends and magnifies what is
 *   behind it as it follows the pointer (backdrop filter, chromatic rim).
 * - `brushed-metal` (card) — fine brushed lines with an anisotropic sheen
 *   that turns with the pointer angle.
 * - `pearlescent` (card) — a nacre / holographic film whose hues shift with
 *   the pointer position.
 * - `god-rays` (background) — volumetric light shafts from a source point
 *   (Canvas 2D, additive).
 * - `pointer-shadow` (hover) — the pointer is the light: the element casts
 *   a soft real-time shadow away from it.
 *
 * Reduced motion: surfaces stay lit from a fixed angle (no tracking),
 * `god-rays` draws one still frame.
 */

/** Track the pointer over `el` as 0–1 coordinates (`fn(x, y, inside)`); starts at (`x0`, `y0`). Returns a remover. */
declare function trackPointer(el: HTMLElement, ctx: EffectContext, fn: (x: number, y: number, inside: boolean) => void, x0?: number, y0?: number): () => void;
declare const LIGHT_FX: EffectDefinition[];
/** Register the 6.4 light & materials pack (idempotent). */
declare function registerLightPack(): void;
/** @deprecated since 6.9 — use `registerLightPack()` (removed in 7.0; `npx usa-codemod-7`). */
declare function registerLightEffects(): void;

export { LIGHT_FX, registerLightEffects, registerLightPack, trackPointer };
