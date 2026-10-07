/**
 * use-scroll-animate - Core Type Definitions
 * A lightweight, high-performance scroll animation library
 */
/** Built-in animation presets */
type AnimationPreset = 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'zoom-in' | 'zoom-out' | 'flip-x' | 'flip-y' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'bounce' | 'rotate-in' | 'blur-in' | 'skew-in' | 'scale-x' | 'scale-y' | 'shimmer' | 'pulse' | 'swing' | 'scale-up' | 'blur-in-up' | 'flip-up' | 'flip-down' | 'rotate-left' | 'rotate-right' | 'clip-up' | 'clip-down' | 'clip-left' | 'clip-right' | 'clip-circle';
/**
 * How `onProgress` (and parallax) progress is measured.
 * - `'ratio'` (default): the element's visible ratio (IntersectionObserver `intersectionRatio`).
 * - `'scroll'`: true scroll progress, 0 when the element's top touches the bottom of the
 *   viewport and 1 when its bottom leaves the top. Works for elements taller than the screen.
 */
type ProgressMode = 'ratio' | 'scroll';
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
/** Parallax configuration */
interface ParallaxOptions {
    /** Movement on X axis (e.g., '100px', '20%') */
    x?: string | number;
    /** Movement on Y axis (e.g., '100px', '20%') */
    y?: string | number;
    /** Rotation in degrees */
    rotate?: number;
    /** Scale factor */
    scale?: number;
    /** Speed multiplier (default: 1) */
    speed?: number;
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
    /** Parallax effect configuration */
    parallax?: ParallaxOptions;
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
    /** How progress for `onProgress`/parallax is measured (default: 'ratio') */
    progressMode?: ProgressMode;
    /**
     * Name of a CSS custom property (e.g. `'--sa-progress'`) that receives the
     * element's progress (0 to 1, same value as `onProgress`) as an inline
     * style, for scroll-driven effects written in plain CSS. Off by default.
     */
    progressVar?: string;
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
     * has been triggered (unless they still need parallax/onProgress), so they can
     * be garbage-collected. They are remembered in a WeakSet, so `init()`/`observe()`
     * never re-hide or replay them. (default: true)
     */
    autoUnregister?: boolean;
}
/** Registered element entry */
interface AnimatedElement {
    element: Element;
    options: Required<AnimateOptions>;
    observer: IntersectionObserver;
    animated: boolean;
    progressObserver?: IntersectionObserver;
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
 * use-scroll-animate - Sequence / timeline helper
 * Chain animations on several targets, one after another (or overlapping).
 */

interface SequenceStep extends AnimateOptions {
    /** Selector, Element, NodeList or Element[] to animate in this step */
    target: string | Element | NodeList | Element[];
    /** Pause (ms) after the previous step ends before this one starts. Negative values overlap. (default: 0) */
    gap?: number;
    /** Absolute start time (ms) on the timeline; overrides `gap` */
    at?: number;
}
interface SequenceOptions extends AnimateOptions {
    /** Play automatically (once) when this element/selector enters the viewport */
    trigger?: string | Element;
    /** Instance whose global config (easing, classes, `disabled`) is used */
    instance?: ScrollAnimateInstance;
}
interface SequenceController {
    /** Play (or replay) the timeline. Resolves when every step has completed, or on `cancel()`. */
    play(): Promise<void>;
    /** Stop the trigger and running animations; elements are left visible. */
    cancel(): void;
    /** Total duration of the timeline in ms (computed for the current DOM). */
    duration(): number;
}
/**
 * Build a timeline of animations.
 *
 * @example
 * sequence([
 *   { target: '.title', animation: 'fade-in-up' },
 *   { target: '.subtitle', animation: 'blur-in', gap: -300 },   // overlap by 300ms
 *   { target: '.card', animation: 'scale-up', stagger: 80 },
 * ], { trigger: '.hero' });
 */
declare function sequence(steps: SequenceStep[], options?: SequenceOptions): SequenceController;

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
 * use-scroll-animate - React Integration
 * Provides useScrollAnimate and useScrollStagger hooks for React applications.
 * `useScrollStagger({ observeChildren: true })` also animates children added later.
 *
 * Both hooks are thin wrappers around the core engine, so they share its
 * behaviour: `once`, `offset`, custom easing functions, parallax,
 * `prefers-reduced-motion` support, and proper cleanup on unmount.
 */

type ReactRef<T> = {
    current: T | null;
};
declare function createReactHooks(React: {
    useRef: <T>(initial: T | null) => ReactRef<T>;
    useEffect: (effect: () => (() => void) | void, deps?: unknown[]) => void;
}): {
    useScrollAnimate: (options?: AnimateOptions) => ReactRef<Element>;
    useScrollStagger: (options?: StaggerOptions) => ReactRef<Element>;
};

/**
 * use-scroll-animate - Vue 3 Integration
 * Provides useScrollAnimate and useScrollStagger composables for Vue 3 applications.
 *
 * A thin wrapper around the core engine, so it shares its behaviour: `once`,
 * `offset`, custom easing functions, parallax, `prefers-reduced-motion`
 * support, and cleanup on unmount.
 */

declare function createVueComposables(Vue: {
    ref: <T>(value: T | null) => {
        value: T | null;
    };
    onMounted: (fn: () => void) => void;
    onUnmounted: (fn: () => void) => void;
}): {
    useScrollAnimate: (options?: AnimateOptions) => {
        animateRef: {
            value: Element | null;
        };
    };
    useScrollStagger: (options?: StaggerOptions) => {
        staggerRef: {
            value: Element | null;
        };
    };
};

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

export { EASING_MAP, PRESETS, createReactHooks, createScrollAnimate, createVueComposables, ScrollAnimate as default, getScrollProgress, resolveEasing, resolvePreset, sequence, staggerChildren };
export type { AnimateOptions, AnimatedElement, AnimationKeyframe, AnimationPreset, CustomAnimation, EasingType, ParallaxOptions, ProgressMode, ScrollAnimateConfig, ScrollAnimateInstance, SequenceController, SequenceOptions, SequenceStep, StaggerOptions };
