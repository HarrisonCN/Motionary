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
 * 9.4 — Video motion (`motionary/fx/video`, also `motionary/components/fx-video`):
 *
 * - `scrubVideo(video, trigger?)` — scroll-driven video: `currentTime`
 *   follows the scroll progress of `trigger` (default the video) through the
 *   viewport, eased. Returns a stop function.
 * - `frameSequence(canvas, { count, src | draw }, trigger?)` — an Apple-style
 *   image sequence scrubbed by scroll: frame `i` is the image `src(i)`
 *   (preloaded) or whatever `draw(ctx, i, w, h)` paints. Returns a stop.
 * - `scrollProgress(el)` — 0 when `el` enters at the bottom, 1 when it leaves
 *   at the top.
 *
 * Effects: `film-burn` (enter) — a warm light leak burns across as the
 * element appears; `jump-cut` (attention) — two hard cuts (zoom / reframe)
 * and back, like an edit. Reduced motion: scrubbing shows the first frame,
 * film-burn fades, jump-cut does nothing.
 */

/** Scroll progress of `el` through the viewport: 0 entering at the bottom → 1 leaving at the top (9.4). */
declare function scrollProgress(el: Element): number;
/** Scroll-driven video: `video.currentTime` follows the scroll progress of `trigger` (9.4). */
declare function scrubVideo(video: HTMLVideoElement, trigger?: Element, opts?: {
    ease?: number;
}): () => void;
interface FrameSequenceSource {
    count: number;
    src?: (i: number) => string;
    draw?: (ctx: CanvasRenderingContext2D, i: number, w: number, h: number) => void;
}
/** Image-sequence scrubbing on a canvas (preloads `src(i)`, or paints with `draw`) (9.4). */
declare function frameSequence(canvas: HTMLCanvasElement, seq: FrameSequenceSource, trigger?: Element): () => void;
declare const VIDEO_FX: EffectDefinition[];
/** Register film-burn and jump-cut (9.4). */
declare function registerVideoPack(): void;

export { VIDEO_FX, frameSequence, registerVideoPack, scrollProgress, scrubVideo };
export type { FrameSequenceSource };
