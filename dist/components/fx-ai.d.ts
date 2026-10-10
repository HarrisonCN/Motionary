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
 * 7.8 — AI UI motion (`motionary/fx/ai`, also `motionary/components/fx-ai`):
 *
 * - `stream-text` (enter) — the element's text appears word by word, like a
 *   streamed LLM reply, with a blinking caret at the end (`speed` ms/word).
 * - `thinking-glow` (loop) — a soft colour glow breathes and drifts round the
 *   element while a model is "thinking" (`colors`); the cleanup stops it.
 * - `voice-wave` (attention) — the element's children bounce in a wave like
 *   voice level bars (or the element pulses when it has none) (`cycles`).
 * - `gen-skeleton` (enter) — a shimmering skeleton covers the element, then
 *   dissolves to reveal the generated content (`hold`).
 *
 * Reduced motion: stream-text shows the text, thinking-glow is skipped,
 * voice-wave does nothing, gen-skeleton fades in.
 */

/** Split text into words, keeping the whitespace after each (7.8). */
declare function splitWords(text: string): string[];
declare const AI_FX: EffectDefinition[];
/** Register stream-text, thinking-glow, voice-wave and gen-skeleton (7.8). */
declare function registerAiPack(): void;

export { AI_FX, registerAiPack, splitWords };
