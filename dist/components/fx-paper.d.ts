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
 * 8.5 — Paper & hand-drawn pack (`motionary/fx/paper`, also `motionary/components/fx-paper`):
 *
 * - `paper-unfold` (enter) — the element unfolds like a folded sheet of paper,
 *   top flap first, with a soft crease shadow (`folds`).
 * - `pencil-sketch` (enter) — SVG strokes inside are sketched in with a
 *   slightly wobbly pencil, one after another (`duration`, `stagger`).
 * - `watercolor` (enter) — the element bleeds in like wet watercolour:
 *   blurred, saturated, spreading from the middle, then dries (`duration`).
 * - `crumple` (attention) — the element scrunches like crumpled paper and
 *   springs back flat.
 *
 * Reduced motion: paper-unfold / watercolor fade in, pencil-sketch shows the
 * drawing, crumple does nothing.
 */

/** A deterministic PRNG in [0, 1) from a seed (8.5). */
declare function paperRandom(seed: number): () => number;
/** A hand-drawn SVG path from (x1,y1) to (x2,y2): a slightly bowed, wobbly line (8.5). */
declare function roughLine(x1: number, y1: number, x2: number, y2: number, seed?: number, amp?: number): string;
declare const PAPER_FX: EffectDefinition[];
/** Register paper-unfold, pencil-sketch, watercolor and crumple (8.5). */
declare function registerPaperPack(): void;

export { PAPER_FX, paperRandom, registerPaperPack, roughLine };
