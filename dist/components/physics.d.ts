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
}
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

declare const SPRING_EFFECTS: readonly ["bounce-in", "pop", "drop", "jelly", "rubber-band"];
type SpringEffect = (typeof SPRING_EFFECTS)[number];
/** Keyframes of a spring effect (entrances use spring timing, attention effects fixed frames). */
declare function springEffectKeyframes(effect: string, reduced?: boolean): Keyframe[];
/**
 * `<usa-spring>` — spring / bounce effects on its content.
 *
 * Attributes: `effect` (`bounce-in` default, `pop`, `drop`, `jelly`,
 * `rubber-band`), `trigger` (`view` default, `hover`, `click`, `manual`),
 * `preset` (`gentle`, `wobbly`, `stiff`, `bouncy`, …) or `stiffness` /
 * `damping` / `mass`, `delay` (ms), `duration` (ms, attention effects; 900),
 * `repeat` (replay every time it re-enters the view), `block`.
 * Events: `usa:complete`. Reduced motion: entrances fade, attention effects do nothing.
 */
interface UsaSpringElement extends UsaElement {
    effect: string;
    play(): Promise<void>;
    reset(): void;
}
declare function defineSpring(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-draggable>` — drag its content with the pointer (mouse, touch, pen)
 * or the arrow keys; physics on release.
 *
 * Attributes: `axis` (`both` default, `x`, `y`), `spring-back` (return to
 * the origin with a spring), `inertia` (keep gliding after a flick),
 * `snap` (grid size like `80`, or points like `0,120,240`), `bounds`
 * (`parent` = stay inside the parent box, rubber-banding past its edges),
 * `preset` (spring, default `wobbly`), `step` (arrow-key step, px, 16),
 * `disabled`. Methods: `moveTo(x, y, animate?)`, `reset()`. Events:
 * `usa:drag-start`, `usa:drag-end` (`{ x, y, vx, vy }`), `usa:settle`.
 * Reduced motion: positions change instantly (no spring or inertia).
 */
interface UsaDraggableElement extends UsaElement {
    readonly x: number;
    readonly y: number;
    readonly dragging: boolean;
    moveTo(x: number, y: number, animate?: boolean): void;
    reset(): void;
}
declare function defineDraggable(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-overscroll>` — an elastic scroll container: pulling past the top or
 * bottom (touch, trackpad or wheel) stretches the content with iOS-style
 * rubber-band resistance and it springs back on release.
 *
 * Attributes: `axis` (`y` default, `x`), `max` (largest stretch in px, 120),
 * `preset` (spring, default `default`), `disabled`. CSS variable
 * `--usa-overscroll` holds the current offset. Reduced motion: no stretch
 * (a plain scroll container with `overscroll-behavior: contain`).
 */
interface UsaOverscrollElement extends UsaElement {
    /** Current stretch in px (negative = pulled past the end). */
    readonly offset: number;
}
declare function defineOverscroll(tag?: string): CustomElementConstructor | undefined;

/**
 * Spring physics core (v2.3). A damped harmonic oscillator integrated in
 * 1 ms steps: `stiffness` (k, N/m), `damping` (c) and `mass` (m). Used by
 * the `<usa-spring>`, `<usa-draggable>` and `<usa-overscroll>` elements and
 * exported for your own animations:
 *
 * - `springEasing()` turns a spring into a CSS `linear()` easing + duration
 *   for WAAPI / CSS (falls back to a cubic-bezier overshoot where `linear()`
 *   is unsupported);
 * - `spring(el, keyframes, cfg)` animates with it;
 * - `createSpring()` is an interruptible, velocity-preserving value for
 *   gestures (drag, inertia, snap).
 */
interface SpringConfig {
    /** Spring stiffness (default 170). Higher = faster, snappier. */
    stiffness?: number;
    /** Damping / friction (default 26). Lower = more bounces. */
    damping?: number;
    /** Mass (default 1). Higher = slower, heavier. */
    mass?: number;
    /** Initial velocity in progress units per second (default 0). */
    velocity?: number;
    /** Rest threshold (default 0.001). */
    precision?: number;
}
type SpringPreset = 'default' | 'gentle' | 'wobbly' | 'stiff' | 'bouncy' | 'slow' | 'molasses';
declare const SPRING_PRESETS: Record<SpringPreset, Required<Pick<SpringConfig, 'stiffness' | 'damping' | 'mass'>>>;
type SpringInput = SpringPreset | SpringConfig | string | undefined;
/** Resolve a preset name or a partial config to a full config. */
declare function resolveSpring(input?: SpringInput): Required<SpringConfig>;
/** One integration step (semi-implicit Euler) towards `to`. Returns [x, v]. */
declare function stepSpring(cfg: Required<SpringConfig>, x: number, v: number, to: number, dt: number): [number, number];
/**
 * Sample the spring from 0 to 1 at `fps` (default 60). `values` may exceed 1
 * (overshoot); `duration` is the time to rest, in ms (max 10 s).
 */
declare function springSamples(input?: SpringInput, fps?: number): {
    values: number[];
    duration: number;
};
/** `true` when CSS `linear()` easing is supported. */
declare function supportsLinearEasing(): boolean;
/**
 * The spring as `{ easing, duration }` for `el.animate()` / CSS. `easing` is
 * a `linear(…)` function with at most `points` stops (default 48), or a
 * cubic-bezier overshoot where `linear()` is unsupported.
 */
declare function springEasing(input?: SpringInput, points?: number): {
    easing: string;
    duration: number;
};
/** Build a CSS `linear()` easing from samples (down-sampled to `points`). */
declare function linearEasing(values: number[], points?: number): string;
/**
 * Animate `el` between keyframes with spring timing (WAAPI). Under reduced
 * motion the final frame is applied immediately. Returns the Animation (or
 * `null` without WAAPI / under reduced motion).
 */
declare function spring(el: Element, keyframes: Keyframe[], input?: SpringInput, options?: KeyframeAnimationOptions): Animation | null;
interface SpringValueOptions {
    /** Start value (default 0). */
    value?: number;
    /** Spring config or preset (default `'default'`). */
    spring?: SpringInput;
    /** Called with the value every frame (and on `jump()`). */
    onUpdate?: (value: number, velocity: number) => void;
    /** Called when the value comes to rest at its target. */
    onRest?: (value: number) => void;
}
interface SpringValue {
    readonly value: number;
    /** Units per second. */
    readonly velocity: number;
    readonly target: number;
    readonly animating: boolean;
    /** Animate to `target`, optionally with a new initial velocity (units/s). */
    set(target: number, velocity?: number): void;
    /** Jump to `value` with no animation. */
    jump(value: number): void;
    /** Stop where it is. */
    stop(): void;
    /** Change the spring config. */
    configure(spring: SpringInput): void;
}
/**
 * An interruptible spring-animated number: call `set()` as often as you like,
 * the motion keeps its velocity (like iOS / Framer springs). Reduced motion
 * jumps straight to the target.
 */
declare function createSpring(opts?: SpringValueOptions): SpringValue;
/**
 * Where a flick at `velocity` (units/s) comes to rest with exponential
 * decay: `value + velocity · timeConstant` (default 0.325 s, iOS-like).
 */
declare function projectInertia(value: number, velocity: number, timeConstant?: number): number;
/** Snap to a grid (`number`) or the nearest of a list of points. */
declare function snapTo(value: number, to: number | number[] | null | undefined): number;
/** iOS-style rubber-band resistance: how far content moves when pulled `distance` past an edge. */
declare function rubberBand(distance: number, dimension: number, constant?: number): number;

/**
 * use-scroll-animate/components/physics — spring & bounce physics (v2.3).
 * `<usa-spring>` (bounce-in, pop, drop, jelly, rubber-band), `<usa-draggable>`
 * (spring-back, inertia, snap) and `<usa-overscroll>` (elastic edges), plus
 * the spring core: `spring()`, `springEasing()`, `createSpring()`,
 * `SPRING_PRESETS`, `projectInertia()`, `snapTo()`, `rubberBand()`.
 */

/** Register every component of this category under its default tag. */
declare function definePhysicsComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-spring': UsaSpringElement;
        'usa-draggable': UsaDraggableElement;
        'usa-overscroll': UsaOverscrollElement;
    }
}

export { SPRING_EFFECTS, SPRING_PRESETS, configureComponents, createSpring, defineDraggable, defineOverscroll, definePhysicsComponents, defineSpring, linearEasing, prefersReducedMotion, projectInertia, resolveSpring, rubberBand, snapTo, spring, springEasing, springEffectKeyframes, springSamples, stepSpring, supportsLinearEasing };
export type { ComponentsConfig, SpringConfig, SpringEffect, SpringInput, SpringPreset, SpringValue, SpringValueOptions, UsaDraggableElement, UsaElement, UsaOverscrollElement, UsaSpringElement };
