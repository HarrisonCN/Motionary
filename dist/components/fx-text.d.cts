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
 * 6.3 — Text effects 3.0 (`motionary/components/fx-text`), registered through
 * `registerEffect()`:
 *
 * - `liquid-text` (loop) — the text ripples like liquid (animated SVG
 *   turbulence + displacement filter).
 * - `neon-write` (text) — letters flicker on one by one like a neon sign
 *   being switched on, then keep a soft glow.
 * - `particle-text` (text) — particles fly in from around the element and
 *   assemble into the glyphs, then hand over to the real text.
 * - `glitch-text` (text) — RGB-split slices jump sideways for a moment.
 * - `text-trail` (cursor) — the letters of a word fall off the pointer.
 * - `font-breathe` (loop) — a variable-font weight wave breathes through the text.
 * - `flip-chars` (text) — every character flips up in 3D, staggered.
 *
 * Splitting keeps a visually hidden copy for screen readers (the animated
 * characters are `aria-hidden`). Reduced motion: loops and the trail are
 * skipped, one-shot effects show the final state without movement.
 */

/** Split `el`'s text into `aria-hidden` inline-block characters (idempotent). Returns them. */
declare function splitChars(el: HTMLElement): HTMLElement[];
declare const TEXT3_FX: EffectDefinition[];
/** Register the 6.3 text pack (idempotent). */
declare function registerTextPack(): void;
/** @deprecated since 6.9 — use `registerTextPack()` (removed in 7.0; `npx usa-codemod-7`). */
declare function registerTextEffects3(): void;

export { TEXT3_FX, registerTextEffects3, registerTextPack, splitChars };
