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
 * 9.1 — Cinematic pack (`motionary/fx/cinema`, also `motionary/components/fx-cinema`):
 *
 * - `dolly-in` (enter) — a slow camera push: the element starts slightly
 *   large and soft and settles sharp, like a dolly shot (`duration`).
 * - `pan-reveal` (enter) — the camera pans across the element while a
 *   wipe uncovers it (`from` left|right).
 * - `letterbox` (enter) — cinema bars slide in, hold, then open up to
 *   reveal the element (`hold`).
 * - `rack-focus` (attention) — focus pulls from the element's first child
 *   to the rest and back, like a focus puller racking between subjects.
 *
 * `cameraFrame(move, p)` gives the transform of a camera move at progress
 * 0–1 (used by `<usa-scene>`). Reduced motion: entrances fade, rack-focus
 * does nothing.
 */

declare const CAMERA_MOVES: readonly ["dolly-in", "dolly-out", "pan-left", "pan-right", "tilt-up", "tilt-down", "zoom-in", "zoom-out", "orbit"];
type CameraMove = (typeof CAMERA_MOVES)[number];
/** Transform of camera `move` at progress `p` (0–1, clamped), `strength` 0–2 (9.1). */
declare function cameraFrame(move: string, p: number, strength?: number): string;
declare const CINEMA_FX: EffectDefinition[];
/** Register dolly-in, pan-reveal, letterbox and rack-focus (9.1). */
declare function registerCinemaPack(): void;

export { CAMERA_MOVES, CINEMA_FX, cameraFrame, registerCinemaPack };
export type { CameraMove };
