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
 * use-scroll-animate - Solid integration
 *
 * ```tsx
 * import { scrollAnimate, scrollStagger, useScrollAnimate } from 'use-scroll-animate/solid';
 * false && scrollAnimate; // keep the directive import (TypeScript)
 *
 * <div use:scrollAnimate={{ animation: 'zoom-in' }}>…</div>
 * <ul use:scrollStagger={{ stagger: 60 }}>…</ul>
 * <div ref={useScrollAnimate({ animation: 'fade-in-up' })}>…</div>
 * ```
 *
 * `solid-js` is an optional peer dependency (only needed for this entry).
 */

interface SolidScrollAnimateOptions extends AnimateOptions {
    instance?: ScrollAnimateInstance;
}
interface SolidScrollStaggerOptions extends StaggerOptions {
    instance?: ScrollAnimateInstance;
}
declare module 'solid-js' {
    namespace JSX {
        interface Directives {
            scrollAnimate: SolidScrollAnimateOptions | true;
            scrollStagger: SolidScrollStaggerOptions | true;
        }
    }
}
/**
 * Directive: `<div use:scrollAnimate={{ animation: 'fade-in' }} />`.
 * 4.0.1: the accessor is tracked — when signals it reads change, callbacks
 * update right away and the other options are re-applied if the element has
 * not animated yet (no manual `refresh()` needed).
 */
declare function scrollAnimate(el: Element, accessor?: () => SolidScrollAnimateOptions | true | undefined): void;
/** Directive: `<ul use:scrollStagger={{ stagger: 60, observeChildren: true }} />` */
declare function scrollStagger(el: Element, accessor?: () => SolidScrollStaggerOptions | true | undefined): void;
/** Primitive returning a `ref` callback: `<div ref={useScrollAnimate({ animation: 'fade-in-up' })} />` */
declare function useScrollAnimate(options?: SolidScrollAnimateOptions): (el: Element) => void;

export { scrollAnimate, scrollStagger, useScrollAnimate };
export type { SolidScrollAnimateOptions, SolidScrollStaggerOptions };
