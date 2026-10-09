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
 * 8.7 — Gestures 3.0 pack (`motionary/fx/gesture`, also `motionary/components/fx-gesture`):
 *
 * - `swipe-hint` (attention) — a ghost fingertip swipes across the element
 *   and the element nudges along, teaching "swipe me" (`direction` left|right).
 * - `pinch-hint` (attention) — two ghost fingertips pinch out and the
 *   element zooms with them, teaching "pinch to zoom".
 * - `tilt-wobble` (attention) — a 3D wobble as if the phone was tilted.
 * - `depth-in` (enter) — children fly in from different depths (by
 *   `data-depth`, default their order), like parallax layers settling.
 *
 * Reduced motion: depth-in just shows, the hints and wobble do nothing.
 */

type Pt = {
    x: number;
    y: number;
};
/** Scale factor of a two-finger pinch from start points (a1, a2) to current points (b1, b2) (8.7). */
declare function pinchScale(a1: Pt, a2: Pt, b1: Pt, b2: Pt): number;
/** Rotation in degrees of a two-finger twist from (a1, a2) to (b1, b2) (8.7). */
declare function pinchAngle(a1: Pt, a2: Pt, b1: Pt, b2: Pt): number;
/** Device orientation (beta front/back, gamma left/right, in degrees) → card tilt { rx, ry } clamped to ±max (8.7). */
declare function orientationToTilt(beta: number, gamma: number, max?: number, rest?: number): {
    rx: number;
    ry: number;
};
declare const GESTURE3_FX: EffectDefinition[];
/** Register swipe-hint, pinch-hint, tilt-wobble and depth-in (8.7). */
declare function registerGesture3Pack(): void;

export { GESTURE3_FX, orientationToTilt, pinchAngle, pinchScale, registerGesture3Pack };
