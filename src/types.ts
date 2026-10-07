/**
 * use-scroll-animate - Core Type Definitions
 * A lightweight, high-performance scroll animation library
 */

/** Built-in animation presets */
export type AnimationPreset =
  | 'fade-in'
  | 'fade-in-up'
  | 'fade-in-down'
  | 'fade-in-left'
  | 'fade-in-right'
  | 'zoom-in'
  | 'zoom-out'
  | 'flip-x'
  | 'flip-y'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'bounce'
  | 'rotate-in'
  | 'blur-in'
  | 'skew-in'
  | 'scale-x'
  | 'scale-y'
  | 'shimmer'
  | 'pulse'
  | 'swing'
  | 'scale-up'
  | 'blur-in-up'
  | 'flip-up'
  | 'flip-down'
  | 'rotate-left'
  | 'rotate-right'
  | 'clip-up'
  | 'clip-down'
  | 'clip-left'
  | 'clip-right'
  | 'clip-circle';

/**
 * How `onProgress` (and parallax) progress is measured.
 * - `'ratio'` (default): the element's visible ratio (IntersectionObserver `intersectionRatio`).
 * - `'scroll'`: true scroll progress, 0 when the element's top touches the bottom of the
 *   viewport and 1 when its bottom leaves the top. Works for elements taller than the screen.
 */
export type ProgressMode = 'ratio' | 'scroll';

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
export type ScrollEngine = 'auto' | 'js' | 'css';

/** Easing function types */
export type EasingType =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring'
  | 'soft-spring'
  | 'heavy-bounce'
  | [number, number, number, number] // cubic-bezier array
  | ((t: number) => number) // custom easing function
  | string;

/** Keyframe definition for custom animations */
export interface AnimationKeyframe {
  [property: string]: string | number;
}

/** Custom animation definition */
export interface CustomAnimation {
  from: AnimationKeyframe;
  to: AnimationKeyframe;
}

/** Parallax configuration */
export interface ParallaxOptions {
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
export interface AnimateOptions {
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
export interface ScrollAnimateConfig {
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
  /** Default animation engine (default: `'auto'`; `'js'` restores the 1.x behaviour) */
  defaultEngine?: ScrollEngine;
}

/** Registered element entry */
export interface AnimatedElement {
  element: Element;
  options: Required<AnimateOptions>;
  observer: IntersectionObserver;
  animated: boolean;
  progressObserver?: IntersectionObserver;
  /** Engine actually used for this element (`'css'` = native scroll-driven timeline) */
  engine?: 'js' | 'css';
}

/** ScrollAnimate public API */
export interface ScrollAnimateInstance {
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
