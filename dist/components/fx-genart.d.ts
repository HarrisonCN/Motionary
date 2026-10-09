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
 * 9.3 — Generative art 2.0 pack (`motionary/fx/genart`, also `motionary/components/fx-genart`):
 *
 * - `halftone-in` (enter) — the element prints in through a growing
 *   halftone dot screen, like a comic-book plate (`dot`).
 * - `mesh-drift` (loop) — a seeded mesh-gradient background that slowly
 *   drifts (`seed`, `palette`).
 * - `kaleido` (loop) — a kaleidoscopic conic overlay that turns slowly
 *   (`color`, `segments`).
 * - `grain-flicker` (loop) — animated film grain over the element.
 *
 * `PALETTES`, `seededRandom(seed)`, `meshGradient(seed, palette)` (a CSS
 * background string) are shared with `<usa-bg-generator>` and
 * `<usa-gen-art>`. Reduced motion: halftone-in fades, loops are skipped.
 */

declare const PALETTES: Record<string, string[]>;
/** Deterministic PRNG in [0, 1) (mulberry32) (9.3). */
declare function seededRandom(seed: number): () => number;
/** A seeded mesh-gradient CSS background (4 radial blobs over a base colour) (9.3). */
declare function meshGradient(seed?: number, palette?: string | string[]): string;
declare const GENART_FX: EffectDefinition[];
/** Register halftone-in, mesh-drift, kaleido and grain-flicker (9.3). */
declare function registerGenArtPack(): void;

export { GENART_FX, PALETTES, meshGradient, registerGenArtPack, seededRandom };
