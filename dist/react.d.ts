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
 * use-scroll-animate - React Integration
 * Provides useScrollAnimate and useScrollStagger hooks for React applications.
 * `useScrollStagger({ observeChildren: true })` also animates children added later.
 *
 * Both hooks are thin wrappers around the core engine, so they share its
 * behaviour: `once`, `offset`, custom easing functions, progress,
 * `prefers-reduced-motion` support, and proper cleanup on unmount.
 */

type ReactRef<T> = {
    current: T | null;
};
/**
 * Wrap the callbacks that exist at mount so they always call the latest
 * version from the most recent render (avoids stale closures without
 * re-creating observers on every render).
 * @internal
 */
declare function withLatestCallbacks(latest: ReactRef<AnimateOptions>): AnimateOptions;
declare function createReactHooks(React: {
    useRef: <T>(initial: T | null) => ReactRef<T>;
    useEffect: (effect: () => (() => void) | void, deps?: unknown[]) => void;
}): {
    useScrollAnimate: (options?: AnimateOptions) => ReactRef<Element>;
    useScrollStagger: (options?: StaggerOptions) => ReactRef<Element>;
};

export { createReactHooks, withLatestCallbacks };
