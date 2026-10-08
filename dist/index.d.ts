/**
 * use-scroll-animate - Core Type Definitions
 * A lightweight, high-performance scroll animation library
 */
/** Built-in animation presets */
type AnimationPreset = 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'zoom-in' | 'zoom-out' | 'flip-x' | 'flip-y' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'bounce' | 'rotate-in' | 'blur-in' | 'skew-in' | 'scale-x' | 'scale-y' | 'shimmer' | 'pulse' | 'swing' | 'scale-up' | 'blur-in-up' | 'flip-up' | 'flip-down' | 'rotate-left' | 'rotate-right' | 'clip-up' | 'clip-down' | 'clip-left' | 'clip-right' | 'clip-circle';
/**
 * How `onProgress` / `progressVar` progress is measured.
 * - `'ratio'` (default): the element's visible ratio (IntersectionObserver `intersectionRatio`).
 * - `'scroll'`: true scroll progress, 0 when the element's top touches the bottom of the
 *   viewport and 1 when its bottom leaves the top. Works for elements taller than the screen.
 */
type ProgressMode = 'ratio' | 'scroll';
/**
 * Which engine runs the entrance animation.
 * - `'js'`: IntersectionObserver triggers a time-based Web Animation.
 * - `'css'`: the preset runs on the browser's native scroll-driven timeline
 *   (`animation-timeline: view()`), so its progress follows the scroll position
 *   off the main thread. Falls back to `'js'` where unsupported.
 * - `'auto'` (default since 2.0): native when supported, JS otherwise — and JS
 *   whenever the element sets `duration`, `delay`, `offset` or `stagger` itself,
 *   since those only mean something for a time-based animation.
 */
type ScrollEngine = 'auto' | 'js' | 'css';
/** Easing function types */
type EasingType = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring' | 'soft-spring' | 'heavy-bounce' | [number, number, number, number] | ((t: number) => number) | string;
/** Keyframe definition for custom animations */
interface AnimationKeyframe {
    [property: string]: string | number;
}
/** Custom animation definition */
interface CustomAnimation {
    from: AnimationKeyframe;
    to: AnimationKeyframe;
}
/** Per-element animation options */
interface AnimateOptions {
    /** Animation preset name, array of presets, or custom animation object */
    animation?: AnimationPreset | AnimationPreset[] | CustomAnimation;
    /** Duration in milliseconds (default: 600) */
    duration?: number;
    /** Delay in milliseconds (default: 0) */
    delay?: number;
    /** Easing function (default: 'ease') */
    easing?: EasingType;
    /** Intersection threshold 0-1 (default: 0.1) */
    threshold?: number | number[];
    /** Root margin for IntersectionObserver (default: '0px') */
    rootMargin?: string;
    /** Whether to replay animation each time element enters viewport (default: false) */
    repeat?: boolean;
    /** Whether to trigger animation only once (default: true if repeat is false) */
    once?: boolean;
    /** Offset in pixels from the viewport edge to trigger animation (default: 0) */
    offset?: number;
    /** Stagger delay for child elements in ms (default: 0) */
    stagger?: number;
    /** Callback fired when animation starts */
    onStart?: (element: Element) => void;
    /** Callback fired when animation completes */
    onComplete?: (element: Element) => void;
    /** Callback fired when element enters viewport */
    onEnter?: (element: Element) => void;
    /** Callback fired when element leaves viewport */
    onLeave?: (element: Element) => void;
    /** Callback fired with scroll progress (0 to 1) */
    onProgress?: (element: Element, progress: number) => void;
    /** How progress for `onProgress`/`progressVar` is measured (default: 'ratio') */
    progressMode?: ProgressMode;
    /**
     * Name of a CSS custom property (e.g. `'--sa-progress'`) that receives the
     * element's progress (0 to 1, same value as `onProgress`) as an inline
     * style, for scroll-driven effects written in plain CSS. Off by default.
     */
    progressVar?: string;
    /**
     * Animation engine (default: `'auto'`, see `ScrollEngine`). With the native
     * engine the animation is linked to scroll position: `duration`, `delay`,
     * `threshold`, `offset` and `stagger` do not apply; `viewRange` does.
     */
    engine?: ScrollEngine;
    /**
     * Native engine only: the view-timeline range the entrance animation spans,
     * as `[rangeStart, rangeEnd]` (default: `['entry 0%', 'entry 100%']`).
     */
    viewRange?: [string, string];
    /**
     * Animate out when the element leaves the viewport, and back in when it
     * re-enters (implies `repeat: true` unless `repeat` is set).
     * - `true`: play the entrance animation in reverse.
     * - a preset / presets / `{ from, to }`: play that animation in reverse
     *   (e.g. `exit: 'fade-in-down'` leaves upwards).
     * Skipped under reduced motion. (default: `false`)
     */
    exit?: boolean | AnimationPreset | AnimationPreset[] | CustomAnimation;
}
/** Global configuration for ScrollAnimate instance */
interface ScrollAnimateConfig {
    /** Default animation preset (default: 'fade-in-up') */
    defaultAnimation?: AnimationPreset | AnimationPreset[] | CustomAnimation;
    /** Default duration in ms (default: 600) */
    defaultDuration?: number;
    /** Default delay in ms (default: 0) */
    defaultDelay?: number;
    /** Default easing (default: 'ease') */
    defaultEasing?: EasingType;
    /** Default threshold (default: 0.1) */
    defaultThreshold?: number | number[];
    /** Default root margin (default: '0px') */
    defaultRootMargin?: string;
    /** Whether animations replay by default (default: false) */
    defaultRepeat?: boolean;
    /** Default once setting (default: true) */
    defaultOnce?: boolean;
    /** Default offset in pixels (default: 0) */
    defaultOffset?: number;
    /** CSS class added before animation (default: 'sa-hidden') */
    hiddenClass?: string;
    /** CSS class added when element is visible (default: 'sa-visible') */
    visibleClass?: string;
    /** Whether to use CSS class-based animation instead of Web Animations API */
    useClassNames?: boolean;
    /** Disable all animations (useful for reduced-motion preference) */
    disabled?: boolean;
    /** Custom IntersectionObserver root element */
    root?: Element | null;
    /**
     * Drop `once` elements from the registry as soon as their entrance animation
     * has been triggered (unless they still need onProgress/progressVar), so they can
     * be garbage-collected. They are remembered in a WeakSet, so `init()`/`observe()`
     * never re-hide or replay them. (default: true)
     */
    autoUnregister?: boolean;
    /** Default animation engine (default: `'auto'`; `'js'` restores the 1.x behaviour) */
    defaultEngine?: ScrollEngine;
}
/** Registered element entry */
interface AnimatedElement {
    element: Element;
    options: Required<AnimateOptions>;
    observer: IntersectionObserver;
    animated: boolean;
    progressObserver?: IntersectionObserver;
    /** Engine actually used for this element (`'css'` = native scroll-driven timeline) */
    engine?: 'js' | 'css';
}
/** ScrollAnimate public API */
interface ScrollAnimateInstance {
    /** Observe a single element or CSS selector */
    observe(target: string | Element | NodeList | Element[], options?: AnimateOptions): void;
    /** Stop observing a single element or CSS selector */
    unobserve(target: string | Element | NodeList | Element[]): void;
    /** Observe all elements matching the data-sa attribute */
    init(rootElement?: Element | Document): void;
    /**
     * Like `init()`, then keep watching `rootElement` (default: `document`) with a
     * MutationObserver: `[data-sa]` elements added later (or that gain the
     * attribute) are observed automatically, and removed ones are released.
     * Returns a function that stops watching. `destroy()` stops every watcher.
     * SSR-safe: a no-op without a DOM / MutationObserver.
     */
    watch(rootElement?: Element | Document): () => void;
    /** Destroy the instance and clean up all observers */
    destroy(): void;
    /** Refresh all observers (useful after DOM changes) */
    refresh(): void;
    /** Manually trigger animation on an element */
    animate(target: string | Element, options?: AnimateOptions): void;
    /** Get all currently observed elements */
    getObservedElements(): AnimatedElement[];
    /** Update global configuration */
    configure(config: Partial<ScrollAnimateConfig>): void;
}

/**
 * use-scroll-animate - Core Implementation
 * Uses IntersectionObserver + Web Animations API for zero-dependency,
 * high-performance scroll-triggered animations.
 */

/**
 * Whether the browser can run presets on a native scroll-driven timeline:
 * `CSS.supports('animation-timeline: view()')` plus the `ViewTimeline`
 * constructor used to attach it from JavaScript. Cached. SSR-safe.
 */
declare function supportsScrollTimeline(): boolean;
/**
 * True scroll progress of `el` through the viewport (or `root`): 0 when its top
 * edge reaches the bottom of the viewport, 1 when its bottom edge passes the top.
 * Works for elements taller than the viewport. Returns 0 without a DOM.
 */
declare function getScrollProgress(el: Element, root?: Element | null): number;
declare function createScrollAnimate(userConfig?: ScrollAnimateConfig): ScrollAnimateInstance;

/**
 * use-scroll-animate - Staggered children
 * Reveal a container's children one after another when the container scrolls
 * into view, optionally also animating children that are added later.
 */

interface StaggerOptions extends AnimateOptions {
    /** Delay between consecutive children in ms (default: 80) */
    stagger?: number;
    /**
     * Watch the container with a MutationObserver and animate children added
     * later (e.g. infinite lists). Children added after the container was
     * revealed animate when they scroll into view, staggered per batch.
     * (default: false)
     */
    observeChildren?: boolean;
}
/**
 * Animate the children of `container` with a stagger once it enters the
 * viewport. Returns a cleanup function. SSR-safe (no-op without a DOM).
 *
 * @example
 * const stop = staggerChildren(document.querySelector('ul'), { stagger: 60, observeChildren: true });
 */
declare function staggerChildren(container: Element | null | undefined, options?: StaggerOptions, instance?: ScrollAnimateInstance): () => void;

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
 * use-scroll-animate - parallax() helper
 *
 * Moves elements at a different speed than the page while they cross the
 * viewport. Built on the same scroll progress as `progressVar` (0 when the
 * element's top enters at the bottom, 1 when its bottom leaves at the top):
 * the progress is written to a CSS custom property (default `--sa-parallax`)
 * and the offset is applied with the individual `translate` property, so it
 * composes with entrance animations and other `transform`s.
 */
interface ParallaxHelperOptions {
    /**
     * Total distance the element shifts while it crosses the viewport, as a
     * fraction of the viewport size (`0.2` = 20vh on the y axis). Positive values
     * lag behind the scroll (background-like), negative values move ahead of it
     * (foreground-like). (default: `0.2`)
     */
    speed?: number;
    /** `'y'` (default) or `'x'` (horizontal drift, in `vw`) */
    axis?: 'x' | 'y';
    /** CSS custom property receiving the progress (default: `'--sa-parallax'`) */
    progressVar?: string;
    /** Scroll container (default: the viewport) */
    root?: Element | null;
    /**
     * Under `prefers-reduced-motion: reduce` no offset is applied (the progress
     * variable is still written). Set to `false` to move anyway. (default: `true`)
     */
    respectReducedMotion?: boolean;
}
/**
 * Apply a scroll parallax to `target` (selector, Element, NodeList or array).
 * Returns a function that stops it and removes the inline styles it set.
 * SSR-safe (no-op without a DOM / IntersectionObserver).
 *
 * @example
 * const stop = parallax('.hero-bg', { speed: 0.3 });
 * parallax('.badge', { speed: -0.15, axis: 'x' });
 */
declare function parallax(target: string | Element | NodeList | Element[], options?: ParallaxHelperOptions): () => void;

/**
 * use-scroll-animate - Animation Presets
 * Defines keyframes for all built-in animation presets
 */

type KeyframeMap = {
    from: Record<string, string | number>;
    to: Record<string, string | number>;
};
declare const PRESETS: Record<AnimationPreset, KeyframeMap>;
declare function resolvePreset(animation: AnimationPreset | AnimationPreset[] | CustomAnimation): KeyframeMap;
/** Easing to CSS cubic-bezier mapping */
declare const EASING_MAP: Record<string, string>;
declare function resolveEasing(easing: EasingType): string;

/**
 * Default singleton instance of ScrollAnimate.
 * Ready to use out of the box with sensible defaults.
 *
 * @example
 * ```js
 * import ScrollAnimate from 'use-scroll-animate';
 *
 * // Auto-initialize all elements with data-sa attribute
 * ScrollAnimate.init();
 *
 * // Or manually observe elements
 * ScrollAnimate.observe('.my-element', { animation: 'fade-in-up' });
 * ```
 */
declare const ScrollAnimate: ScrollAnimateInstance;

export { EASING_MAP, PRESETS, TIMELINE_PRESETS, createScrollAnimate, ScrollAnimate as default, getScrollProgress, parallax, resolveEasing, resolvePosition, resolvePreset, staggerChildren, supportsNativeScrub, supportsScrollTimeline, timeline };
export type { AnimateOptions, AnimatedElement, AnimationKeyframe, AnimationPreset, CustomAnimation, EasingType, ParallaxHelperOptions, ProgressMode, ScrollAnimateConfig, ScrollAnimateInstance, ScrollEngine, ScrubHandle, ScrubOptions, StaggerOptions, Timeline, TimelineOptions, TimelinePosition, TimelineStepOptions };
