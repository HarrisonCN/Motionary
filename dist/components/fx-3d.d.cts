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
 * 6.5 — 3D scene cards (`motionary/components/fx-3d`), registered through
 * `registerEffect()`:
 *
 * - `depth-stack` (card, persistent) — the children (or `[data-depth]`
 *   layers) separate in Z and parallax against each other as the card tilts
 *   toward the pointer.
 * - `product-spin` (card, persistent) — a 360° product viewer: drag to turn
 *   the element in 3D with inertia, idles with a slow turntable spin.
 * - `card-flip-3d` (click) — a thick card flips to its back face (second
 *   child) with an edge that shows its depth.
 * - `origami` (enter) — the element unfolds panel by panel like folded paper.
 * - `orbit-camera` (scroll, persistent) — while the element scrolls through
 *   the viewport the camera orbits its 3D children.
 *
 * Reduced motion: no tilt, spin, orbit or fold; the flip swaps faces with a
 * crossfade.
 */

declare const DEPTH3_FX: EffectDefinition[];
/** Register the 6.5 3D pack (idempotent). */
declare function register3dEffects(): void;

export { DEPTH3_FX, register3dEffects };
