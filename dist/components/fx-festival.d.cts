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
 * 8.1 — Festival packs (`motionary/fx/festival`, also `motionary/components/fx-festival`):
 *
 * - `firework-burst` (attention) — rockets of sparks burst out of the element
 *   in festive colours (`bursts`, `colors`).
 * - `lantern-rise` (enter) — the element floats up and sways in like a
 *   Lunar New Year lantern (`sway`).
 * - `xmas-snow` (loop) — snowflakes drift down over the element; the cleanup
 *   stops them (`flakes`).
 * - `spooky-float` (attention) — the element wobbles and fades like a
 *   Halloween ghost (`cycles`).
 *
 * Reduced motion: firework-burst / spooky-float do nothing, xmas-snow is
 * skipped, lantern-rise fades in. Particles are `aria-hidden` and removed.
 */

/** Evenly spread spark directions with a little jitter (8.1). */
declare function sparkVectors(n: number, radius: number, seed?: number): {
    x: number;
    y: number;
}[];
declare const FESTIVAL_FX: EffectDefinition[];
/** Register firework-burst, lantern-rise, xmas-snow and spooky-float (8.1). */
declare function registerFestivalPack(): void;

export { FESTIVAL_FX, registerFestivalPack, sparkVectors };
