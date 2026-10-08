/**
 * use-scroll-animate/components — shared base for the `<usa-*>` custom elements.
 *
 * Everything here is lazy: nothing touches `window`, `document`,
 * `HTMLElement` or `matchMedia` at import time, so the components can be
 * imported during SSR (Next, Nuxt, Astro…) and in Electron/Tauri preload
 * scripts. Classes are created the first time a `define*()` function runs.
 */
interface ComponentsConfig {
    /**
     * Inject each component's CSS when it is defined (default `true`). Uses a
     * constructable stylesheet (`document.adoptedStyleSheets`, which a strict
     * `style-src` CSP does not block) and falls back to a `<style>` tag. Set
     * to `false` when you load `use-scroll-animate/components.css` yourself.
     */
    injectStyles?: boolean;
    /**
     * `'user'` (default) follows `prefers-reduced-motion`; `'reduce'` always
     * uses the reduced variants (e.g. a kiosk / battery-saver mode);
     * `'no-preference'` ignores the OS setting (only for demos — respect your users).
     */
    reducedMotion?: 'user' | 'reduce' | 'no-preference';
    /**
     * Global motion intensity (v2.7): `'off'` (same as reduced motion),
     * `'low'` (shorter, calmer), `'normal'` (default) or `'high'`. Scales every
     * component animation's duration and sets `--usa-motion` (0 / 0.6 / 1 /
     * 1.25) on `<html>` for your own CSS. See `setMotionIntensity()`.
     */
    motionIntensity?: MotionIntensity;
}
type MotionIntensity = 'off' | 'low' | 'normal' | 'high';
/** Change global component settings (call before `define*()` for `injectStyles`). */
declare function configureComponents(options: ComponentsConfig): void;
/** `true` when animations should be reduced (OS setting or `configureComponents`). */
declare function prefersReducedMotion(): boolean;
/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
}

/**
 * Where a step starts on a timeline:
 * - a number: absolute time in ms
 * - `'>'` (default): when the previous step ends · `'<'`: when it starts
 * - `'+=200'` / `'-=200'`: after / overlapping the previous end
 * - `'<+=100'`: 100ms after the previous step's start
 * - `'intro'` / `'intro+=150'`: at (or relative to) a label
 */
type TimelinePosition = number | string;
interface TimelineStepOptions {
    /** Duration in ms (default: timeline default, 600). */
    duration?: number;
    /** CSS easing (default `cubic-bezier(0.22, 1, 0.36, 1)`). */
    easing?: string;
    /** Start position, see `TimelinePosition`. */
    at?: TimelinePosition;
    /** ms between targets when the selector matches several elements. */
    stagger?: number;
}
interface TimelineOptions {
    /** Defaults for every step. */
    defaults?: Pick<TimelineStepOptions, 'duration' | 'easing' | 'stagger'>;
    /** Playback rate (1 = normal). */
    speed?: number;
    /** Called after `play()` reaches the end (or the start when reversed). */
    onComplete?: () => void;
    /** Called on every frame with progress 0–1. */
    onUpdate?: (progress: number) => void;
}
interface ScrubOptions {
    /** Scroll offset (px) before the source's top reaches the viewport bottom where progress starts (JS engine only). */
    offset?: number;
    /** Smoothing 0–1 (0 = immediate, default 0). Smoothing needs the JS engine. */
    smooth?: number;
    /**
     * 4.1: which progress source drives the timeline.
     * - `'view'` (default): `source` moving through the viewport (CSS `ViewTimeline`, range `cover`).
     * - `'scroll'`: the scroll position of `source` itself (a scroll container; CSS `ScrollTimeline`).
     */
    source?: 'view' | 'scroll';
    /** 4.1: `'auto'` (default) uses the browser's native scroll-driven animations when available, `'js'` forces the fallback. */
    engine?: 'auto' | 'native' | 'js';
    /** 4.1: scroll axis, `'block'` (default) · `'inline'` · `'x'` · `'y'`. */
    axis?: 'block' | 'inline' | 'x' | 'y';
}
/** The function `scrub()` returns: call it to stop. `native` tells which engine runs it. */
interface ScrubHandle {
    (): void;
    /** `true` when the browser's ScrollTimeline / ViewTimeline drives it (compositor, no JS per frame). */
    readonly native: boolean;
}
/** 4.1: whether `scrub()` can use native ScrollTimeline / ViewTimeline here. */
declare function supportsNativeScrub(source?: 'view' | 'scroll'): boolean;
interface Timeline {
    /** Total length in ms. */
    readonly duration: number;
    /** Label positions in ms. */
    readonly labels: Readonly<Record<string, number>>;
    /** Current playhead in ms. */
    readonly time: number;
    /** Add a step: animate `target` with keyframes or a preset name (`fade-up`, `scale`…). */
    to(target: string | Element | Element[] | NodeList, frames: Keyframe[] | string, options?: TimelineStepOptions): Timeline;
    /** Name a position (default: the current end). */
    label(name: string, at?: TimelinePosition): Timeline;
    /** Run `fn` when the playhead passes `at`. */
    call(fn: () => void, at?: TimelinePosition): Timeline;
    /** Play forwards from the playhead (from 0 when at the end). Resolves at the end. */
    play(from?: TimelinePosition): Promise<void>;
    /** Play backwards to 0. */
    reverse(): Promise<void>;
    pause(): Timeline;
    /** Jump to a time (ms) or label. */
    seek(to: TimelinePosition): Timeline;
    /** Get or set progress 0–1. */
    progress(p?: number): number;
    /**
     * Tie progress to scroll: `source` moving through the viewport (or, with
     * `{ source: 'scroll' }`, a scroll container's own position). Runs on native
     * ScrollTimeline / ViewTimeline when available (and no `smooth`, `offset`,
     * `call()` cues or `onUpdate` need JS), else on a rAF-throttled listener.
     * Returns a stop function with a `native` flag.
     */
    scrub(source: Element, options?: ScrubOptions): ScrubHandle;
    /** Stop and drop every animation (elements keep their last frame). */
    cancel(): void;
}
/** Keyframe presets usable by name in `to()` and `data-tl`. */
declare const TIMELINE_PRESETS: Record<string, Keyframe[]>;
/** Resolve a position against the previous step and labels (pure). */
declare function resolvePosition(pos: TimelinePosition | undefined, end: number, prevStart: number, labels?: Record<string, number>): number;
/**
 * Choreograph animations on one clock: chain, overlap, label, seek, reverse and
 * scrub them with scroll. Built on WAAPI (paused animations driven by one
 * playhead); without WAAPI or under reduced motion it jumps to the end state.
 *
 * @example
 * const tl = timeline({ defaults: { duration: 500 } })
 *   .to('.title', 'fade-up')
 *   .label('cards')
 *   .to('.card', 'scale', { stagger: 80, at: '-=200' })
 *   .to('.cta', [{ opacity: 0 }, { opacity: 1 }], { at: 'cards+=400' });
 * tl.play();             // or tl.scrub(document.querySelector('.hero'))
 */
declare function timeline(options?: TimelineOptions): Timeline;

/**
 * `<usa-timeline>` — declarative choreography. Every descendant with
 * `data-tl="<preset>"` becomes a step, in document order; `data-at`
 * (`'-=200'`, `'<'`, `'label+=100'`, ms), `data-duration` and `data-label`
 * fine-tune it.
 *
 * Attributes: `trigger` (`view` default · `click` · `manual`), `scrub`
 * (progress follows scroll instead of playing), `overlap` (ms each step
 * overlaps the previous, default 0), `duration` (600), `stagger` (ms),
 * `repeat` (replay every time it enters the viewport). 4.1: `scrub` runs on native
 * ScrollTimeline / ViewTimeline when supported (`data-native` is set); `scrub="js"`,
 * `scrub="scroll"` and `smooth` tune it. Methods: `play()`,
 * `reverse()`, `seek(t)`; property `timeline`. Event `usa:complete`.
 * Reduced motion: steps appear in their final state.
 */
interface UsaTimelineElement extends UsaElement {
    readonly timeline: Timeline | null;
    play(): Promise<void>;
    reverse(): Promise<void>;
    seek(to: number | string): void;
}
declare function defineTimeline(tag?: string): CustomElementConstructor | undefined;

/**
 * use-scroll-animate/components/timeline — choreography (v3.1).
 * `timeline()` chains, overlaps, labels, seeks, reverses and scroll-scrubs
 * WAAPI animations on one playhead; `<usa-timeline>` builds one from
 * `data-tl` children.
 */

/** Register every component of this category under its default tag. */
declare function defineTimelineComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-timeline': UsaTimelineElement;
    }
}

export { TIMELINE_PRESETS, configureComponents, defineTimeline, defineTimelineComponents, prefersReducedMotion, resolvePosition, supportsNativeScrub, timeline };
export type { ComponentsConfig, ScrubHandle, ScrubOptions, Timeline, TimelineOptions, TimelinePosition, TimelineStepOptions, UsaElement, UsaTimelineElement };
