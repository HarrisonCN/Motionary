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
type SpringInput = SpringPreset | SpringConfig | string | undefined;

type MotionPlayState = 'idle' | 'running' | 'paused' | 'finished';
/** The one controller interface of Motion Engine v2 (animate, sequence, parallel, stagger, spring and timeline all return it). */
interface MotionControls {
    /** Total length in ms (`Infinity` with `repeat: Infinity`). */
    readonly duration: number;
    /** Playhead in ms; setting it seeks. */
    currentTime: number;
    /** Playhead as 0–1 of `duration`; setting it seeks. */
    progress: number;
    /** Speed and direction (negative = reversed). Default 1. */
    playbackRate: number;
    readonly playState: MotionPlayState;
    /** Resolves (with these controls) when playback reaches its end — or 0 when reversed; rejects with an `AbortError` on `cancel()`. A new promise after each finish. */
    readonly finished: Promise<MotionControls>;
    play(): MotionControls;
    pause(): MotionControls;
    /** Jump to `ms` (clamped to 0–duration) and render it. */
    seek(ms: number): MotionControls;
    /** Flip the direction (and play). */
    reverse(): MotionControls;
    /** Jump to the end (or 0 when reversed) and resolve `finished`. */
    finish(): MotionControls;
    /** Stop, remove every effect this motion applied, reject `finished`. */
    cancel(): void;
}
interface ControlOptions {
    /** Start playing right away (default `true`). */
    autoplay?: boolean;
    /** Speed (default 1; negative plays backwards). */
    playbackRate?: number;
    /** `'respect'` (default): under `prefers-reduced-motion` playing jumps to the end. `'ignore'`: always animate. */
    reducedMotion?: 'respect' | 'ignore';
    /** Called after each rendered frame / seek with the 0–1 progress. */
    onUpdate?: (progress: number) => void;
    /** Called when playback finishes. */
    onComplete?: () => void;
}

/** Engine generation (14.0 = 2). */
declare const MOTION_ENGINE_VERSION = 2;
type EasingInput = string | ((p: number) => number);
interface MotionOptions extends ControlOptions {
    /** ms, or a duration token (`'{duration.fast}'`, `'fast'`). Default 300. */
    duration?: number | string;
    delay?: number;
    endDelay?: number;
    /** CSS easing, `'{easing.standard}'` token, or a function of 0–1. Default `ease` for elements, `linear` for objects and callbacks. */
    easing?: EasingInput;
    /** Extra passes (`Infinity` = forever; such a motion cannot be composed). */
    repeat?: number;
    /** Every other pass runs backwards. */
    alternate?: boolean;
}
type MotionTarget = string | Element | ArrayLike<Element> | Record<string, any> | ((progress: number) => void);
type MotionKeyframes = Keyframe[] | PropertyIndexedKeyframes | string | Record<string, number | number[]>;
/** A CSS `cubic-bezier()` as a function of 0–1. */
declare function cubicBezier(x1: number, y1: number, x2: number, y2: number): (p: number) => number;
/** A CSS easing string (keyword, `cubic-bezier()`, `steps()`, `linear(…)`, token) or function → function of 0–1. */
declare function toEasingFn(e?: EasingInput): (p: number) => number;
/**
 * Animate a target: elements (selector / Element / list; keyframes, a preset name such as `'fade-up'`, or
 * property-indexed keyframes), a plain object (numeric props) or a callback `(progress) => void`.
 */
declare function animate(target: (progress: number) => void, options?: MotionOptions): MotionControls;
declare function animate(target: MotionTarget, keyframes: MotionKeyframes, options?: MotionOptions): MotionControls;
/** Run children one after another (`gap` ms between them; negative overlaps). */
declare function sequence(children: MotionControls[], options?: SequenceOptions): MotionControls;
interface SequenceOptions extends ControlOptions {
    gap?: number;
    repeat?: number;
    alternate?: boolean;
}
/** Run children together; the duration is the longest child's. */
declare function parallel(children: MotionControls[], options?: SequenceOptions): MotionControls;
interface StaggerOptions extends MotionOptions {
    /** ms between consecutive starts (default 50). */
    each?: number;
    /** Where the wave starts: `'first'` (default), `'last'`, `'center'` or an index. */
    from?: 'first' | 'last' | 'center' | number;
}
/** One animation per element, each starting `each` ms after the previous — or offset existing controllers. */
declare function stagger(targets: MotionControls[], options?: StaggerOptions): MotionControls;
declare function stagger(targets: string | ArrayLike<Element>, keyframes: MotionKeyframes, options?: StaggerOptions): MotionControls;
/**
 * Animate with spring physics: duration and easing come from the spring (`'bouncy'`, a preset name,
 * `{ stiffness, damping, mass, velocity }`, or a motion token `'{spring.snappy}'`). Overshoots.
 */
declare function spring(target: (progress: number) => void, spring?: SpringInput, options?: ControlOptions & {
    delay?: number;
}): MotionControls;
declare function spring(target: MotionTarget, keyframes: MotionKeyframes, spring?: SpringInput, options?: ControlOptions & {
    delay?: number;
}): MotionControls;
interface TimelineBuilder extends MotionControls {
    /** Add a child at a position (ms, `'>'`, `'<'`, `'+=n'`, `'-=n'`, `'label'`, `'label+=n'`; default `'>'` = after the last). */
    add(child: MotionControls, position?: number | string): TimelineBuilder;
    /** Name the current end (or a position) for later `add()` calls. */
    label(name: string, position?: number | string): TimelineBuilder;
}
/**
 * Place children on one playhead with the timeline position grammar; returns controls that keep
 * accepting `add()` / `label()`. Also accepts `[[child, position], …]` up front.
 */
declare function timeline(entries?: [MotionControls, (number | string)?][] | MotionOptions, options?: SequenceOptions): TimelineBuilder;

export { MOTION_ENGINE_VERSION, animate, cubicBezier, parallel, sequence, spring, stagger, timeline, toEasingFn };
export type { ControlOptions, EasingInput, MotionControls, MotionKeyframes, MotionOptions, MotionPlayState, MotionTarget, SequenceOptions, SpringInput, StaggerOptions, TimelineBuilder };
