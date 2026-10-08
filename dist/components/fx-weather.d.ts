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
 * 6.8 — Weather & ambience (`motionary/components/fx-weather`), registered
 * through `registerEffect()` (kind `background`, Canvas 2D):
 *
 * - `rain-glass` — droplets sit on a window pane, grow, and run down leaving
 *   trails.
 * - `snowfall` — flakes drift down and pile up along the bottom edge.
 * - `lightning` — a safe storm: branching bolts at most once per `interval`
 *   (≥ 2.5 s, far below the WCAG 2.3.1 limit of 3 flashes / s), the sky glow
 *   is capped at 22 % brightness and there is no flash at all under reduced
 *   motion.
 * - `fog` — soft layered fog banks drifting at different speeds.
 * - `aurora-veil` — curtains of northern lights waving over a night sky.
 * - `day-cycle` — the sky moves through dawn, day, dusk and night with the sun
 *   and moon on an arc (`cycle` seconds, or a fixed `hour` 0–24).
 *
 * Every effect renders only while visible, adapts its quality and draws one
 * static frame under reduced motion.
 */

/** Sky colours (top, bottom) for an hour 0–24. */
declare function skyAt(hour: number): [string, string];
declare const WEATHER_FX: EffectDefinition[];
/** Register the 6.8 weather & ambience pack (idempotent). */
declare function registerWeatherPack(): void;

export { WEATHER_FX, registerWeatherPack, skyAt };
