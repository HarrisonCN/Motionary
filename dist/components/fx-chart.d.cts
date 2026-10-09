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
 * 7.2 — Data-viz motion (`motionary/fx/chart`, also
 * `motionary/components/fx-chart`): entrances for the charts you already
 * have (any SVG or HTML chart library), registered through `registerEffect()`:
 *
 * - `bars-grow` (enter) — bars (`[data-bar]`, `rect`, or the children) grow
 *   from the baseline in a stagger.
 * - `line-draw` (enter) — every SVG `path` / `polyline` / `line` draws itself.
 * - `ring-sweep` (enter) — SVG `circle` arcs sweep around from 12 o'clock.
 * - `sankey-flow` (loop) — dashes flow along the SVG links (`[data-flow]` or
 *   every stroked `path`) to show direction and volume.
 * - `number-roll` (enter) — numbers (`[data-value]` or the text) count up
 *   with locale formatting.
 * - `dots-pop` (enter) — scatter / line points (`circle`, `[data-dot]`) pop in.
 *
 * Reduced motion: final state with a short fade (sankey-flow is static).
 */

/** Parse a number out of text like "$1,234.5k" → { n, pre, post, dec }. */
declare function parseFigure(s: string): {
    n: number;
    pre: string;
    post: string;
    dec: number;
} | null;
declare const CHART_FX: EffectDefinition[];
/** Register the 7.2 data-viz motion pack (idempotent). */
declare function registerChartPack(): void;

export { CHART_FX, parseFigure, registerChartPack };
