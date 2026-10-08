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
 * 6.6 — Morph & SVG 2.0 (`motionary/components/fx-morph`), registered
 * through `registerEffect()`:
 *
 * - `path-morph` (loop) — an SVG `<path>` flows between shapes (`paths`, any
 *   number of `d` strings): both shapes are resampled to the same number of
 *   points, so paths with different commands still morph smoothly.
 * - `blob-button` (hover, persistent) — a liquid blob behind the element
 *   wobbles and bulges toward the pointer.
 * - `stroke-draw` (enter) — every stroke in an inline SVG draws itself,
 *   staggered, then the fills fade in.
 * - `noise-reveal` (enter) — the element condenses out of SVG turbulence
 *   (displacement + blur) — an SVG-filter transition.
 * - `icon-swap` (click) — cycles through the element's child icons with a
 *   gooey morph (blur + scale + rotate crossfade).
 *
 * Reduced motion: no loops / wobble; enter effects and swaps fade.
 */

/** Sample `d` into `n` points (needs SVG geometry support; `null` without it). */
declare function samplePath(d: string, n?: number): [number, number][] | null;
/** Points → closed path `d`. */
declare const pointsToPath: (pts: [number, number][]) => string;
declare const MORPH2_FX: EffectDefinition[];
/** Register the 6.6 morph & SVG pack (idempotent). */
declare function registerMorphPack(): void;

export { MORPH2_FX, pointsToPath, registerMorphPack, samplePath };
