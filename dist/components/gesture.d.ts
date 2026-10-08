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
    /**
     * Motion-sensitivity level (v4.4), finer than reduced motion:
     * `'full'` (default) · `'gentle'` (no spins, zooms, skews or parallax —
     * translations and fades only, safe for vestibular disorders) ·
     * `'minimal'` (fades only; components use their reduced-motion variants) ·
     * `'static'` (no animation: every component shows its static alternative).
     * See `setMotionSensitivity()` in `use-scroll-animate/components/a11y`.
     */
    motionSensitivity?: MotionSensitivity;
}
type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
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

interface PanState {
    /** Offset from the gesture start (px). */
    dx: number;
    dy: number;
    /** Velocity (px/s). */
    vx: number;
    vy: number;
    first: boolean;
    last: boolean;
    event: Event;
}
type SwipeDirection = 'left' | 'right' | 'up' | 'down';
interface SwipeState {
    direction: SwipeDirection;
    velocity: number;
    dx: number;
    dy: number;
}
interface PinchState {
    scale: number; /** Midpoint of the two pointers (client px). */
    x: number;
    y: number;
    first: boolean;
    last: boolean;
}
interface PressState {
    x: number;
    y: number;
}
interface GestureHandlers {
    onPan?: (s: PanState) => void;
    onSwipe?: (s: SwipeState) => void;
    onPinch?: (s: PinchState) => void;
    onLongPress?: (s: PressState) => void;
    onTap?: (s: PressState) => void;
    onDoubleTap?: (s: PressState) => void;
}
interface GestureOptions {
    /** Restrict panning to an axis. */
    axis?: 'x' | 'y';
    /** Movement (px) before a pan starts (default 4). */
    threshold?: number;
    /** Minimum distance (px, default 40) and speed (px/s, default 300) for a swipe. */
    swipeDistance?: number;
    swipeVelocity?: number;
    /** Long-press delay (ms, default 500). */
    longPress?: number;
    /** Ctrl/⌘ + wheel (trackpad pinch) counts as pinch (default true). */
    wheelPinch?: boolean;
}
/** The swipe a pointer release represents, or `null` (pure). */
declare function swipeDirection(dx: number, dy: number, vx: number, vy: number, o?: {
    distance?: number;
    velocity?: number;
    axis?: 'x' | 'y';
}): SwipeState | null;
/** Scale between two pointer distances, clamped to [min, max] (pure). */
declare function pinchScale(startDistance: number, distance: number, base?: number, min?: number, max?: number): number;
/**
 * One recognizer for pan, swipe, pinch (two pointers or Ctrl + wheel),
 * long-press, tap and double-tap, with velocities ready to hand to a spring
 * (`createSpring().set(target, velocity)`). Works with mouse, touch and pen
 * through Pointer Events. Returns a cleanup function.
 *
 * @example
 * const x = createSpring({ onUpdate: (v) => (card.style.translate = `${v}px`) });
 * gesture(card, {
 *   onPan: ({ dx, last, vx }) => (last ? x.set(0, vx) : x.jump(dx)),
 *   onSwipe: ({ direction }) => dismiss(direction),
 * }, { axis: 'x' });
 */
declare function gesture(el: HTMLElement, h: GestureHandlers, o?: GestureOptions): () => void;

/**
 * `<usa-swipeable>` — swipe-to-dismiss / swipe actions. The content follows
 * the finger (rubber-banded past `distance`), flies out on a swipe or a drag
 * past `distance`, otherwise springs home with the release velocity.
 *
 * Attributes: `axis` (`x` default · `y`), `distance` (px, 120), `preset`
 * (spring), `dismiss` (remove the element after flying out), `disabled`.
 * Keyboard: Delete/Backspace dismisses, ←/→ swipe. Events `usa:swipe`
 * (`{ direction }`, cancelable), `usa:dismiss`. Methods `swipe(dir)`, `reset()`.
 * Reduced motion: no follow / fly-out animation, events still fire.
 */
interface UsaSwipeableElement extends UsaElement {
    swipe(direction: SwipeDirection): void;
    reset(): void;
    readonly offset: number;
}
declare function defineSwipeable(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-pinch-zoom>` — pinch (two fingers or Ctrl/⌘ + wheel / trackpad
 * pinch) to zoom its content, pan while zoomed, double-tap to toggle zoom;
 * scale and position spring back inside the bounds on release.
 *
 * Attributes: `min` (1), `max` (4), `double-tap` (zoom level, 2), `preset`.
 * Keyboard: `+` / `-` / `0`. Property `scale`, method `zoomTo(scale)`.
 * Event `usa:zoom` (`{ scale }`). Reduced motion: zoom changes instantly.
 */
interface UsaPinchZoomElement extends UsaElement {
    readonly scale: number;
    zoomTo(scale: number): void;
}
declare function definePinchZoom(tag?: string): CustomElementConstructor | undefined;

/**
 * use-scroll-animate/components/gesture — unified gestures (v3.2).
 * `gesture()` recognises pan, swipe, pinch, long-press, tap and double-tap
 * with release velocities for springs; `<usa-swipeable>` (swipe-to-dismiss)
 * and `<usa-pinch-zoom>` are built on it.
 */

/** Register every component of this category under its default tag. */
declare function defineGestureComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-swipeable': UsaSwipeableElement;
        'usa-pinch-zoom': UsaPinchZoomElement;
    }
}

export { configureComponents, defineGestureComponents, definePinchZoom, defineSwipeable, gesture, pinchScale, prefersReducedMotion, swipeDirection };
export type { ComponentsConfig, GestureHandlers, GestureOptions, PanState, PinchState, PressState, SwipeDirection, SwipeState, UsaElement, UsaPinchZoomElement, UsaSwipeableElement };
