/**
 * motionary - Core Type Definitions
 * A lightweight, high-performance scroll animation library
 */
/** The 33 core presets (always available in `PRESETS`). */
type CorePreset = 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'zoom-in' | 'zoom-out' | 'flip-x' | 'flip-y' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'bounce' | 'rotate-in' | 'blur-in' | 'skew-in' | 'scale-x' | 'scale-y' | 'shimmer' | 'pulse' | 'swing' | 'scale-up' | 'blur-in-up' | 'flip-up' | 'flip-down' | 'rotate-left' | 'rotate-right' | 'clip-up' | 'clip-down' | 'clip-left' | 'clip-right' | 'clip-circle';
/**
 * Every built-in preset name: the core set plus the 6.1 extended set, which is
 * available once `motionary/presets/extended` is loaded (or after
 * `registerPresets(EXTENDED_PRESETS)`).
 */
type AnimationPreset = CorePreset | ExtendedPreset;
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
/** The 6.1 extended presets (`motionary/presets/extended`). */
type ExtendedPreset = 'fade-in-up-sm' | 'fade-in-down-sm' | 'fade-in-left-sm' | 'fade-in-right-sm' | 'fade-in-up-lg' | 'fade-in-down-lg' | 'fade-in-left-lg' | 'fade-in-right-lg' | 'fade-in-up-left' | 'fade-in-up-right' | 'fade-in-down-left' | 'fade-in-down-right' | 'fade-in-scale' | 'fade-in-half' | 'zoom-in-up' | 'zoom-in-down' | 'zoom-in-left' | 'zoom-in-right' | 'zoom-out-up' | 'zoom-out-down' | 'zoom-out-left' | 'zoom-out-right' | 'zoom-in-big' | 'zoom-out-big' | 'zoom-bounce' | 'zoom-in-rotate' | 'scale-x-left' | 'scale-x-right' | 'scale-y-top' | 'scale-y-bottom' | 'stretch-x' | 'stretch-y' | 'flip-x-reverse' | 'flip-y-reverse' | 'flip-y-full' | 'flip-diagonal' | 'flip-diagonal-reverse' | 'flip-left' | 'flip-right' | 'unfold-down' | 'unfold-up' | 'door-open-left' | 'door-open-right' | 'fold-in' | 'flip-x-bounce' | 'flip-y-bounce' | 'swing-in-top' | 'swing-in-bottom' | 'swing-in-left' | 'swing-in-right' | 'slide-up-spring' | 'slide-down-spring' | 'slide-left-spring' | 'slide-right-spring' | 'slide-up-sm' | 'slide-down-sm' | 'back-in-up' | 'back-in-down' | 'back-in-left' | 'back-in-right' | 'light-speed-in-left' | 'light-speed-in-right' | 'rise-in' | 'sink-in' | 'float-in-up' | 'float-in-down' | 'roll-in-left' | 'roll-in-right' | 'spiral-in' | 'spiral-in-reverse' | 'spin-in' | 'rotate-in-up-left' | 'rotate-in-up-right' | 'rotate-in-down-left' | 'rotate-in-down-right' | 'skew-in-left' | 'skew-in-y' | 'shear-in' | 'shear-in-reverse' | 'twist-in' | 'tilt-in-left' | 'tilt-in-right' | 'blur-in-down' | 'blur-in-left' | 'blur-in-right' | 'blur-in-strong' | 'blur-in-zoom' | 'blur-in-scale' | 'blur-in-x' | 'mask-up' | 'mask-down' | 'mask-left' | 'mask-right' | 'blur-mask-up' | 'clip-circle-top' | 'clip-circle-bottom' | 'clip-circle-left' | 'clip-circle-right' | 'clip-circle-corner' | 'clip-ellipse' | 'clip-diamond' | 'clip-split-x' | 'clip-split-y' | 'clip-box' | 'clip-pill' | 'clip-blinds' | 'clip-blinds-x' | 'clip-diagonal' | 'clip-diagonal-reverse' | 'clip-slant-right' | 'clip-slant-left' | 'bounce-in' | 'bounce-in-up' | 'bounce-in-down' | 'bounce-in-left' | 'bounce-in-right' | 'elastic-in' | 'elastic-in-x' | 'rubber-in' | 'jello-in' | 'wobble-in' | 'tada-in' | 'heartbeat-in' | 'drop-in' | 'pop-in' | 'squash-in' | 'shake-in' | 'swing-in' | 'brightness-in' | 'darken-in' | 'color-in' | 'saturate-in' | 'hue-in' | 'sepia-in' | 'invert-in' | 'contrast-in' | 'exposure-in' | 'vintage-in' | 'blur-bright-in' | 'shadow-lift' | 'neon-glow-in' | 'glow-in' | 'perspective-in-up' | 'perspective-in-down' | 'perspective-in-left' | 'perspective-in-right' | 'depth-push' | 'depth-pull' | 'depth-in-up' | 'swoop-in-left' | 'swoop-in-right' | 'card-tilt-in' | 'glitch-in' | 'glitch-in-color' | 'typewriter' | 'typewriter-lines' | 'hinge-in' | 'flicker-in' | 'scan-in' | 'materialize' | 'teleport-in' | 'stagger-fade-up' | 'stagger-pop' | 'stagger-rise' | 'stagger-slide' | 'stagger-flip' | 'stagger-blur' | 'stagger-zoom' | 'stagger-drop' | 'scrub-parallax-up' | 'scrub-parallax-down' | 'scrub-rotate' | 'scrub-spin' | 'scrub-scale' | 'scrub-shrink' | 'scrub-pan-left' | 'scrub-pan-right' | 'scrub-tilt' | 'scrub-fade-through' | 'scrub-blur-through' | 'scrub-reveal-x';
/** Easing function types */
type EasingType = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring' | 'soft-spring' | 'heavy-bounce' | [number, number, number, number] | ((t: number) => number) | string;
/** Keyframe definition for custom animations */
interface AnimationKeyframe {
    [property: string]: string | number;
}
/** One intermediate keyframe of a preset: `offset` is 0 < offset < 1. */
interface AnimationFrame extends AnimationKeyframe {
    offset: number;
}
/** Custom animation definition */
interface CustomAnimation {
    from: AnimationKeyframe;
    to: AnimationKeyframe;
    /** Optional intermediate keyframes (overshoot, bounce, …), played between `from` and `to`. */
    frames?: AnimationFrame[];
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
 * motionary - `<scroll-animate>` Web Component
 *
 * ```html
 * <script type="module">
 *   import { defineScrollAnimate } from 'motionary/element';
 *   defineScrollAnimate(); // registers <scroll-animate>
 * </script>
 * <scroll-animate animation="fade-in-up" duration="800">…</scroll-animate>
 * ```
 *
 * Attributes mirror the `data-sa-*` attributes without the prefix
 * (`animation`, `duration`, `delay`, `easing`, `threshold`, `root-margin`,
 * `offset`, `once`, `repeat`, `engine`, `view-range`, `progress`,
 * `progress-var`, `exit`). The element dispatches `sa:enter`,
 * `sa:leave`, `sa:start`, `sa:complete` and `sa:progress` (`detail.progress`)
 * events. It renders as `display: block` unless styled otherwise.
 */

/**
 * Register the custom element (default tag `scroll-animate`) and return its
 * class. Safe to call more than once and on the server (returns `undefined`
 * without `customElements`).
 */
declare function defineScrollAnimate(tagName?: string, instance?: ScrollAnimateInstance): CustomElementConstructor | undefined;

export { defineScrollAnimate };
