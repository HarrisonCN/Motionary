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
 * 7.6 — Maps & geo motion (`motionary/fx/geo`, also `motionary/components/fx-geo`):
 *
 * - `route-draw` (enter) — every SVG `path` / `polyline` inside the element
 *   (or `[data-route]` only, when present) draws itself along its length,
 *   one after another (`duration`, `stagger`).
 * - `marker-pulse` (attention) — rings expand out of the element like a
 *   location beacon (`color`, `rings`).
 * - `pin-drop` (enter) — the element drops onto its spot with a squash and a
 *   landing shadow (`height`).
 * - `globe-spin` (enter) — the element turns in like a globe coming round
 *   (rotateY with perspective) (`turns`).
 *
 * Reduced motion: route-draw shows the routes, marker-pulse does nothing,
 * pin-drop and globe-spin fade in.
 */

/** Length of a polyline through `points` (7.6). */
declare function routeLength(points: {
    x: number;
    y: number;
}[]): number;
declare const GEO_FX: EffectDefinition[];
/** Register route-draw, marker-pulse, pin-drop and globe-spin (7.6). */
declare function registerGeoPack(): void;

export { GEO_FX, registerGeoPack, routeLength };
