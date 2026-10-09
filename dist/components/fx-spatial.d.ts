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
 * 8.8 — XR / spatial pack (`motionary/fx/spatial`, also `motionary/components/fx-spatial`):
 *
 * - `portal-open` (enter) — the element opens like a portal: a ring of
 *   light expands and the content comes through from depth (`color`).
 * - `orbit-in` (enter) — the element swings in around the vertical axis
 *   like a spatial window placed beside you (`from` left|right).
 * - `spatial-float` (loop) — a gentle floating in depth with a breathing
 *   shadow; the cleanup stops it.
 * - `depth-pop` (attention) — the element pops forward towards the viewer
 *   and settles back.
 *
 * Reduced motion: portal-open / orbit-in just show, spatial-float is
 * skipped, depth-pop does nothing.
 */

/** Horizontal background offset (px) of a 360° panorama `width` px wide for a `yaw` in degrees (wraps) (8.8). */
declare function yawToOffset(yaw: number, width: number): number;
/** Which WebXR session the browser offers: `'immersive-vr'`, `'immersive-ar'`, `'inline'` or `'none'` (8.8). */
declare function xrSupport(): Promise<'immersive-vr' | 'immersive-ar' | 'inline' | 'none'>;
declare const SPATIAL_FX: EffectDefinition[];
/** Register portal-open, orbit-in, spatial-float and depth-pop (8.8). */
declare function registerSpatialPack(): void;

export { SPATIAL_FX, registerSpatialPack, xrSupport, yawToOffset };
