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
 * 6.7 — Transitions 2.0 (`motionary/components/fx-transitions`), registered
 * through `registerEffect()` (kind `page`; option `mode: 'in' | 'out'`):
 *
 * - `ripple-dissolve` — a circle with a ripple ring grows from the pointer
 *   (or `x` / `y` 0–1) and reveals / hides the element.
 * - `shatter` — the element breaks into shards that fly apart (out) or
 *   fly together (in).
 * - `mosaic-flip` — a grid of tiles flips over in a diagonal wave.
 * - `liquid-wipe` — a wavy liquid edge sweeps across.
 * - `page-curl` — the element turns like a page around its left edge.
 * - `camera-dolly` — a dolly zoom: scale + depth blur + fade.
 *
 * `pageTransition(update, effect)` runs a DOM update inside the View
 * Transitions API (when available) and plays the effect on the new snapshot;
 * without the API it runs `update()` and plays the effect on `target`.
 * `crossDocumentTransitions(effect)` opts an MPA into cross-document view
 * transitions (`@view-transition { navigation: auto }`) with the same look.
 * Reduced motion: plain short fades.
 */

declare const TRANSITIONS2_FX: EffectDefinition[];
/**
 * Run `update` (a DOM change) as a transition: inside `document.startViewTransition`
 * when supported (the new snapshot plays `effect`), otherwise `update()` then the
 * effect on `target` (default `document.body`'s first element).
 */
declare function pageTransition(update: () => void | Promise<void>, effect?: string, options?: Record<string, unknown>, target?: HTMLElement): Promise<void>;
/** Opt a multi-page site into cross-document view transitions with an effect's look. Returns a remover. */
declare function crossDocumentTransitions(effect?: string, duration?: number): () => void;
/** Register the 6.7 transitions pack (idempotent). */
declare function registerTransitionEffects2(): void;

export { TRANSITIONS2_FX, crossDocumentTransitions, pageTransition, registerTransitionEffects2 };
