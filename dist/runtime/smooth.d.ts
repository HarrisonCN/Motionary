/**
 * 11.4: runtime tiers. **basic** — ticker, tween, timeline, scroll, text, CSS / WAAPI keyframes; **standard** — smooth
 * scrolling, drag-snap, SVG, sprites, GIF / APNG / WebP, Lottie; **advanced** — WebGL, 3D file parsing and decoders,
 * physics. A page that only uses basic modules never downloads standard or advanced code.
 */
type RuntimeTier = 'basic' | 'standard' | 'advanced';
/** A runtime module: `{ id, version, api }`, registered with `use()`. */
interface RuntimeModule<A = unknown> {
    /** Module id: 'core', 'format-css', 'scroll', … (import path `motionary/runtime/<id>`). */
    id: string;
    version: string;
    /** Other modules this one needs (registered first by `use()` callers). */
    requires?: string[];
    /** 11.4: runtime tier — basic · standard · advanced (docs/runtime-tiers.md). */
    tier?: RuntimeTier;
    /** The module's public API (what `requireModule(id)` returns). */
    api: A;
    /** Optional one-time setup, called on first registration. */
    setup?(registry: RuntimeRegistry): void;
}
interface RuntimeRegistry {
    version: string;
    modules: Map<string, RuntimeModule>;
    /** Shared per-page state slots (the ticker lives here). */
    slots: Record<string, unknown>;
}

/** Easing functions (t ∈ [0, 1] → progress). Original implementations of the standard Penner-style curves. */
type Ease = (t: number) => number;

/**
 * `motionary/runtime/smooth` (10.4) — smooth (inertial) scrolling on the
 * runtime ticker, written for Motionary (own implementation and API).
 *
 * - Wheel / trackpad input is eased towards its target (`lerp` or a fixed
 *   `duration` + `ease`) on the shared ticker; keyboard, scrollbar dragging,
 *   find-in-page and screen-reader scrolling stay native (the target follows
 *   them), touch stays native by default (`touch: true` to smooth it).
 * - Works on the window or inside any scrollable `wrapper`; vertical or
 *   horizontal; nested scrollables and `[data-smooth-ignore]` are left alone.
 * - Anchor links (`#id`) glide to their target (with `offset`), focus moves
 *   for keyboard users, and the URL hash is kept.
 * - **Off under `prefers-reduced-motion: reduce`** (and while the media query
 *   matches; it re-enables when it stops matching) — wheel scrolling is then
 *   fully native. `force: true` overrides this only for non-motion use cases.
 * - Real `scroll` events still fire, so `motionary/runtime/scroll` scenes,
 *   IntersectionObservers and CSS scroll timelines all keep working.
 * SSR-safe: nothing touches `window` until `smoothScroll()` is called.
 */

interface SmoothOptions {
    /** Scroll container (default: the window / document scroller). */
    wrapper?: HTMLElement | Window;
    /** Easing factor per 60 fps frame, 0–1 (default 0.1). Ignored when `duration` is set. */
    lerp?: number;
    /** Fixed glide time in ms (with `ease`) instead of `lerp`. */
    duration?: number;
    ease?: string | Ease;
    orientation?: 'vertical' | 'horizontal';
    /** Wheel delta multiplier (default 1). */
    wheelMultiplier?: number;
    /** Smooth touch scrolling too (default false: native momentum is better on touch devices). */
    touch?: boolean;
    touchMultiplier?: number;
    /** Glide to `#anchor` links (default true). */
    anchors?: boolean | {
        offset?: number;
    };
    /** Ignore prefers-reduced-motion (default false — leave it off unless the motion is essential). */
    force?: boolean;
    onScroll?: (s: SmoothScroll) => void;
}
interface ScrollToOptions2 {
    offset?: number;
    /** Jump without animating. */
    immediate?: boolean;
    duration?: number;
    ease?: string | Ease;
    onComplete?: () => void;
}
declare class SmoothScroll {
    /** Current (animated) scroll position, px. */
    current: number;
    /** Where the scroll is heading, px. */
    target: number;
    /** px per frame of the last update. */
    velocity: number;
    /** True while gliding. */
    isScrolling: boolean;
    private o;
    private el;
    private win;
    private stopped;
    private reduced;
    private off;
    private tickOff;
    private written;
    private glide;
    private listeners;
    private touchY;
    constructor(o?: SmoothOptions);
    private on;
    private get horizontal();
    private axis;
    /** The scroll position the browser reports. */
    get native(): number;
    /** Maximum scroll, px. */
    get limit(): number;
    /** 0–1 */
    get progress(): number;
    /** Smoothing is running (not stopped, not reduced motion). */
    get active(): boolean;
    private wheel;
    private push;
    private start;
    private tick;
    private easeOf;
    private write;
    private halt;
    private anchor;
    /** Scroll to a position (px), an element, or a selector. Animated unless reduced motion / `immediate`. */
    scrollTo(to: number | string | Element, o?: ScrollToOptions2): void;
    /** Pause smoothing (native scrolling everywhere) — e.g. while a modal is open. */
    stop(): void;
    /** Resume after `stop()`. */
    resume(): void;
    /** Listen to every smoothed frame; returns an unsubscribe function. */
    onScroll(fn: (s: SmoothScroll) => void): () => void;
    /** Remove all listeners and restore native scrolling. */
    destroy(): void;
}
/** Start smooth scrolling (see module docs). Off under reduced motion. */
declare function smoothScroll(o?: SmoothOptions): SmoothScroll;
/** Every live instance. */
declare const allSmooth: () => SmoothScroll[];
interface SmoothApi {
    smoothScroll: typeof smoothScroll;
    allSmooth: typeof allSmooth;
    SmoothScroll: typeof SmoothScroll;
}
/** The module object for `use(smooth)`. */
declare const smooth: RuntimeModule<SmoothApi>;

export { SmoothScroll, allSmooth, smooth, smoothScroll };
export type { ScrollToOptions2, SmoothApi, SmoothOptions };
