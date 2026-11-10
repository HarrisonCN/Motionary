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
 * 17.3 — Hover pack (`motionary/fx/hover` = `motionary/components/fx-hover`), registered through `registerEffect()`.
 * Each effect is persistent: run it once (`bindEffect(el, name, { trigger: 'load' })`, `<usa-fx trigger="load">` or
 * `playEffect`) and it reacts to pointer hover and keyboard focus until the returned cleanup runs. Running it again on
 * the same element (for example with `trigger: 'hover'`) only replays its enter state.
 *
 * - `text-roll` — every letter rolls up and is replaced by a copy rolling in from below, one after another.
 * - `image-swap` — a second picture (`src`, or the element's second `<img>`) opens as a circle from the pointer.
 * - `focus-reveal` — the words start soft; a focus frame travels across them and sharpens each one.
 * - `grid-warp` — the element shears and tilts toward the pointer over a faint grid, then springs back.
 * - `googly-eyes` — two eyes pop up on the element and their pupils follow the pointer.
 *
 * Text effects keep a visually hidden copy of the original text for screen readers; every added layer is
 * `aria-hidden` and removed by the cleanup. Reduced motion: text effects leave the text static, `image-swap`
 * crossfades, `grid-warp` and `googly-eyes` do nothing.
 */

declare const HOVER_FX: EffectDefinition[];
/** Register the 17.3 hover pack (idempotent). */
declare function registerHoverPack(): void;

export { HOVER_FX, registerHoverPack };
