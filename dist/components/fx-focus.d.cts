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
 * 6.9 — Focus & feedback (`motionary/components/fx-focus`), registered
 * through `registerEffect()`:
 *
 * - `focus-draw` (kind `attention`) — a rounded ring draws itself around the
 *   element, then fades (great on `focus`).
 * - `marching-ants` (kind `loop`) — a dashed selection border that marches
 *   (drop targets, selections).
 * - `success-check` (kind `click`) — a check mark draws over the element on a
 *   soft green disc, then fades away.
 * - `highlight-sweep` (kind `attention`) — a highlighter stroke sweeps
 *   behind the element's text.
 *
 * Overlays are SVG / spans marked `aria-hidden` and removed when done.
 * Reduced motion: a plain fade of the final state (marching-ants is static).
 */

declare const FOCUS_FX: EffectDefinition[];
/** Register the 6.9 focus & feedback pack (idempotent). */
declare function registerFocusPack(): void;

export { FOCUS_FX, registerFocusPack };
