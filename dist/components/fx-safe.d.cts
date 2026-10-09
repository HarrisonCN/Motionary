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
 * 9.5 — Accessible motion 2.0 (`motionary/fx/safe`, also `motionary/components/fx-safe`):
 *
 * - `vestibularSafe(keyframes)` — strips movement (translate / scale /
 *   rotate / skew / perspective, clip and blur) from keyframes, keeping
 *   opacity and colour, so any animation can get a vestibular-safe twin.
 * - `flashCount(keyframes, duration)` / `isFlashSafe(...)` — counts large
 *   opacity / brightness swings and checks WCAG 2.3.1's three-flashes-per-
 *   second limit.
 * - `applyMotionPreferences(prefs)` / `loadMotionPreferences()` — the
 *   settings behind `<usa-motion-prefs>`: sensitivity level, speed (shared
 *   clock rate), pause autoplay, no parallax; persisted in localStorage and
 *   exposed as `data-usa-*` attributes on `<html>` for your CSS.
 *
 * Effects that never move anything: `safe-fade` (enter), `focus-glow`
 * (attention), `color-pulse` (attention), `underline-sweep` (hover).
 */

/** Keyframes with all movement removed (opacity / colour / shadow kept; blur removed from filters) (9.5). */
declare function vestibularSafe(frames: Keyframe[]): Keyframe[];
/** Number of flashes (a ≥ 0.3 luminance swing that comes back) in one run of `frames` (9.5). */
declare function flashCount(frames: Keyframe[]): number;
/** WCAG 2.3.1: no more than three flashes in any one second (9.5). */
declare function isFlashSafe(frames: Keyframe[], duration: number, iterations?: number): boolean;
interface MotionPreferences {
    sensitivity: MotionSensitivity;
    speed: number;
    pauseAutoplay: boolean;
    noParallax: boolean;
}
declare const MOTION_PREFS_KEY = "usa-motion-prefs";
declare const DEFAULT_MOTION_PREFS: MotionPreferences;
/** Apply (and persist) motion preferences: sensitivity, shared clock speed, `data-usa-*` flags on `<html>` (9.5). */
declare function applyMotionPreferences(p: Partial<MotionPreferences>, persist?: boolean): MotionPreferences;
/** Saved preferences (or the defaults) (9.5). */
declare function loadMotionPreferences(): MotionPreferences;
declare const SAFE_FX: EffectDefinition[];
/** Register safe-fade, focus-glow, color-pulse and underline-sweep (9.5). */
declare function registerSafePack(): void;

export { DEFAULT_MOTION_PREFS, MOTION_PREFS_KEY, SAFE_FX, applyMotionPreferences, flashCount, isFlashSafe, loadMotionPreferences, registerSafePack, vestibularSafe };
export type { MotionPreferences };
