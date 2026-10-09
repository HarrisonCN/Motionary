/** Put an animation on the shared motion clock (animateWithMotion does this for every component / effect animation). */
declare function trackAnimation(a: Animation | null | undefined): void;
/** The motion clock's state: `rate` (1 = normal), `paused`, `time` (clock ms elapsed, scaled by rate). */
declare function getClock(): {
    rate: number;
    paused: boolean;
    time: number;
    tracked: number;
};
/** Change the shared clock: `{ rate }` (0.05–8) and / or `{ paused }`. Applies to running animations and loops. */
declare function setClock(next: {
    rate?: number;
    paused?: boolean;
}): void;
/** Subscribe to clock changes; returns an unsubscribe. */
declare function onClockChange(fn: () => void): () => void;

/**
 * `motionary/engine` (= `motionary/components/engine`, 8.0) — the unified
 * timeline engine and SSR hydration animations.
 *
 * - **`motionClock`** — the one clock every component, effect and frame loop
 *   runs on: `rate` (slow-mo / fast-forward), `pause()` / `resume()` /
 *   `toggle()`, `time`, `onChange()`. Pausing it freezes every animation
 *   started by Motionary on the page.
 * - **`createTimeline()`** — sequence animations on that clock:
 *   `add(target, keyframes, options, position)` with positions `1200`
 *   (ms), `'+=200'` / `'-=100'` (after / overlapping the previous end) or
 *   `'<'` / `'<+=80'` (with the previous start); `play()`, `pause()`,
 *   `seek(ms)`, `progress` (0–1, settable), `duration`, `finished`.
 * - **`hydrateMotion()`** — animate server-rendered `[data-usa-hydrate]`
 *   markup in on hydration without a flash: `ssrHead()` gives the `<style>`
 *   + one-line `<script>` for the document head (content stays visible
 *   without JS, and a CSS fallback reveals it after 3 s if JS never runs).
 */

/** The shared motion clock (8.0). */
declare const motionClock: {
    rate: number;
    readonly paused: boolean;
    /** Clock time in ms (advances with the shared frame loop, scaled by `rate`, frozen while paused). */
    readonly time: number;
    pause(): void;
    resume(): void;
    toggle(): void;
    onChange: typeof onClockChange;
};
type TimelinePosition = number | string;
interface TimelineEntry {
    target: Element;
    keyframes: Keyframe[];
    options: KeyframeAnimationOptions;
    start: number;
    end: number;
}
interface MotionTimeline {
    readonly entries: readonly TimelineEntry[];
    readonly duration: number;
    readonly playing: boolean;
    progress: number;
    readonly finished: Promise<void>;
    add(target: Element | Element[] | NodeListOf<Element> | null, keyframes: Keyframe[], options?: number | KeyframeAnimationOptions, position?: TimelinePosition): MotionTimeline;
    play(): MotionTimeline;
    pause(): MotionTimeline;
    seek(ms: number): MotionTimeline;
    restart(): MotionTimeline;
    cancel(): void;
}
/** Resolve a timeline position against the previous entry (8.0). */
declare function resolvePosition(position: TimelinePosition | undefined, prev: {
    start: number;
    end: number;
} | null, total: number): number;
/** Sequence animations on the shared clock (8.0). */
declare function createTimeline(defaults?: KeyframeAnimationOptions & {
    autoplay?: boolean;
}): MotionTimeline;
/** Hydration presets for `data-usa-hydrate="…"` (8.0). */
declare const HYDRATE_PRESETS: Record<string, Keyframe[]>;
/**
 * CSS that keeps `[data-usa-hydrate]` hidden only while JS is on and the
 * page has not hydrated yet (`html.usa-js`), with a 3 s CSS fallback so the
 * content can never stay invisible (8.0).
 */
declare const HYDRATION_CSS = "html.usa-js [data-usa-hydrate]:not([data-usa-hydrated]),html.usa-js usa-hydrate:not([data-usa-hydrated])>*{opacity:0;animation:usa-hydrate-fallback 0s 3s forwards}@keyframes usa-hydrate-fallback{to{opacity:1}}@media (prefers-reduced-motion:reduce){html.usa-js [data-usa-hydrate]:not([data-usa-hydrated]),html.usa-js usa-hydrate:not([data-usa-hydrated])>*{opacity:1;animation:none}}";
/** `<style>` + inline `<script>` for the SSR document head (8.0). Pass a CSP `nonce` if you use one. */
declare function ssrHead(nonce?: string): string;
interface HydrateOptions {
    /** Delay between elements in document order (ms). Default 60. */
    stagger?: number;
    /** Duration per element (ms). Default 600. */
    duration?: number;
    /** Fallback preset when `data-usa-hydrate` is empty. Default `fade-up`. */
    preset?: string;
    easing?: string;
}
/**
 * Animate server-rendered `[data-usa-hydrate]` elements in (document order,
 * staggered; per-element `data-usa-delay`), mark them `data-usa-hydrated`
 * and emit `usa:hydrated` on the root. Returns the timeline (8.0).
 */
declare function hydrateMotion(root?: ParentNode, options?: HydrateOptions): MotionTimeline;

export { HYDRATE_PRESETS, HYDRATION_CSS, createTimeline, getClock, hydrateMotion, motionClock, onClockChange, resolvePosition, setClock, ssrHead, trackAnimation };
export type { HydrateOptions, MotionTimeline, TimelineEntry, TimelinePosition };
