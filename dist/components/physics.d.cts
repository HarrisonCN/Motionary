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
 * 17.16 — the spring core of the micro-interaction system.
 *
 * - **Exact:** springs are solved in closed form (under-, critically and over-damped), so a value is the same at
 *   30, 60 or 144 Hz and never drifts or explodes on a long frame. The older `createSpring()` (v2.3, numeric steps)
 *   stays as it was.
 * - **Perceptual:** a spring can be given as `{ duration, bounce }` (response time in ms and how much it overshoots,
 *   -1…1) instead of stiffness / damping / mass; `springFromFeel()` and `springFeel()` convert both ways.
 * - **Tuned:** `MICRO_SPRINGS` holds sixteen springs for the roles of a micro-interaction (press, release, hover,
 *   toggle, drag, settle, pop, jelly …), and `MICRO_FEELS` seven feels that retune all of them at once
 *   (`crisp`, `snappy`, `smooth`, `bouncy`, `playful`, `calm`, `heavy`).
 * - **Interruptible:** `createSpringGroup()` animates several named values on one frame loop. Retargeting keeps the
 *   current velocity, `impulse()` adds velocity (a flick, a shake, a pop), and every channel can use its own spring.
 *   Under reduced motion values jump to their targets and impulses do nothing.
 */
/** A spring as response time and bounce. `duration` in ms (default 400); `bounce` from -1 (overdamped) to 1 (default 0). */
interface SpringFeel {
    duration?: number;
    bounce?: number;
}
/** Stiffness (N/m), damping (N·s/m) and mass (kg). */
interface SpringPhysics {
    stiffness: number;
    damping: number;
    mass: number;
}
type MicroSpring = 'instant' | 'snappy' | 'smooth' | 'gentle' | 'bouncy' | 'elastic' | 'press' | 'release' | 'hover' | 'toggle' | 'drag' | 'settle' | 'pop' | 'jelly' | 'heavy' | 'feather';
/** Sixteen springs tuned for the parts of a micro-interaction. */
declare const MICRO_SPRINGS: Record<MicroSpring, Required<SpringFeel>>;
type MicroFeel = 'crisp' | 'snappy' | 'smooth' | 'bouncy' | 'playful' | 'calm' | 'heavy';
/** A feel retunes every role spring: durations are divided by `speed` and `bounce` is added to their bounce. */
declare const MICRO_FEELS: Record<MicroFeel, {
    speed: number;
    bounce: number;
}>;
/** `{ duration, bounce }` → stiffness / damping / mass (mass 1 unless given). */
declare function springFromFeel(feel?: SpringFeel, mass?: number): SpringPhysics;
/** Stiffness / damping / mass → `{ duration, bounce, dampingRatio }`. */
declare function springFeel(p: SpringPhysics): {
    duration: number;
    bounce: number;
    dampingRatio: number;
};
type MicroSpringInput = MicroSpring | SpringPreset | SpringFeel | SpringPhysics | string | undefined | null;
/**
 * Any spring description → physics: a `MICRO_SPRINGS` name, a v2.3 `SPRING_PRESETS` name, `"<duration>[ms] <bounce>"`
 * (e.g. `"380ms 0.3"`), `{ duration, bounce }` or `{ stiffness, damping, mass }`. `feel` retunes it and `speed`
 * (e.g. a look's `--mo-kit-speed`) shortens or stretches it. Unknown input is the `smooth` spring.
 */
declare function microSpring(input?: MicroSpringInput, feel?: MicroFeel | string | null, speed?: number): SpringPhysics;
/**
 * The closed-form motion from `from` towards `to` starting at `velocity` (units/s). Returns a function of elapsed
 * time in ms that gives `[value, velocity]`.
 */
declare function springSolution(p: SpringPhysics, from: number, to: number, velocity?: number): (ms: number) => [number, number];
/** When a motion from `from` to `to` comes to rest within `precision` (a fraction of the distance; default 0.001), in ms (max 10 s). */
declare function settleTime(p: SpringPhysics, from?: number, to?: number, velocity?: number, precision?: number): number;
/** The spring from 0 to 1 as a CSS `linear()` easing and its duration in ms, for `el.animate()` / transitions. */
declare function microEasing(input?: MicroSpringInput, feel?: MicroFeel | string | null, points?: number): {
    easing: string;
    duration: number;
};
interface SpringGroupOptions {
    /** Default spring for every channel (default `smooth`). */
    spring?: MicroSpringInput;
    /** Feel that retunes every spring of the group. */
    feel?: MicroFeel | string | null;
    /** Speed factor (e.g. a look's `--mo-kit-speed`; default 1). */
    speed?: number;
    /** Owner element: the loop stops when it is detached. */
    owner?: Element;
    /** Called once per frame (and after `jump()`) with every value. */
    onUpdate?: (values: Record<string, number>, group: SpringGroup) => void;
    /** Called when every channel has come to rest. */
    onRest?: (values: Record<string, number>) => void;
    /** Rest precision in value units (default 0.001). */
    precision?: number;
    /** Ignore reduced motion (for values that are not motion, e.g. a colour mix). */
    always?: boolean;
}
interface SpringGroup {
    readonly values: Record<string, number>;
    readonly animating: boolean;
    get(name: string): number;
    /** Velocity of a channel, in units per second. */
    velocity(name: string): number;
    target(name: string): number;
    /** Animate channels to new targets. `velocity` replaces their velocity; `spring` sets their spring from now on. */
    set(targets: Record<string, number>, opts?: {
        velocity?: Record<string, number>;
        spring?: MicroSpringInput;
    }): void;
    /** Add velocity (units/s) to channels; they spring back to their targets. Optionally with a one-off spring. */
    impulse(velocities: Record<string, number>, spring?: MicroSpringInput): void;
    /** Move channels at once, with no motion. */
    jump(values: Record<string, number>): void;
    /** Change the default spring, feel or speed (running channels keep theirs until set again). */
    configure(opts: {
        spring?: MicroSpringInput;
        feel?: MicroFeel | string | null;
        speed?: number;
    }): void;
    /** Stop every channel where it is. */
    stop(): void;
}
/**
 * Several spring-animated numbers that share one frame loop (on the motion clock, so `setClock()` slows or pauses
 * them too). Retargeting keeps velocity; each channel keeps the spring it was last set with.
 */
declare function createSpringGroup(initial: Record<string, number>, opts?: SpringGroupOptions): SpringGroup;

/**
 * motionary/components/physics — spring & bounce physics (v2.3).
 * `<usa-spring>` (bounce-in, pop, drop, jelly, rubber-band), `<usa-draggable>`
 * (spring-back, inertia, snap) and `<usa-overscroll>` (elastic edges), plus
 * the spring core: `spring()`, `springEasing()`, `createSpring()`,
 * `SPRING_PRESETS`, `projectInertia()`, `snapTo()`, `rubberBand()`.
 * 17.16 adds the exact spring solver of the micro-interaction system: `springSolution()`, `springFromFeel()` /
 * `springFeel()` (duration + bounce), `microSpring()`, `MICRO_SPRINGS`, `MICRO_FEELS`, `settleTime()`,
 * `microEasing()` and `createSpringGroup()`.
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

export { MICRO_FEELS, MICRO_SPRINGS, SPRING_EFFECTS, SPRING_PRESETS, createSpring, createSpringGroup, defineDraggable, defineOverscroll, definePhysicsComponents, defineSpring, linearEasing, microEasing, microSpring, projectInertia, resolveSpring, rubberBand, settleTime, snapTo, spring, springEasing, springEffectKeyframes, springFeel, springFromFeel, springSamples, springSolution, stepSpring, supportsLinearEasing };
export type { MicroFeel, MicroSpring, MicroSpringInput, SpringConfig, SpringEffect, SpringFeel, SpringGroup, SpringGroupOptions, SpringInput, SpringPhysics, SpringPreset, SpringValue, SpringValueOptions, UsaDraggableElement, UsaOverscrollElement, UsaSpringElement };
