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

type Target = object | Element;
type Props = Record<string, number | string>;
interface PlayOptions {
    /** Delay before the first iteration, ms. */
    delay?: number;
    /** Extra iterations (-1 = forever). */
    repeat?: number;
    /** Alternate direction on every other iteration. */
    yoyo?: boolean;
    /** Start paused (`play()` to start). */
    paused?: boolean;
    onUpdate?: (progress: number) => void;
    onComplete?: () => void;
}
interface TweenOptions extends PlayOptions {
    to?: Props;
    from?: Props;
    /** ms (default 600). */
    duration?: number;
    ease?: string | Ease;
    /** Delay added per target index (ms) when several targets are given. */
    stagger?: number;
}
/** Common playback: delay, repeat, yoyo, direction, ticker attachment, promise. */
declare abstract class Playable {
    delay: number;
    repeat: number;
    yoyo: boolean;
    /** Playback rate multiplier. */
    timeScale: number;
    onUpdate?: (progress: number) => void;
    onComplete?: () => void;
    protected _t: number;
    private _dir;
    private _off;
    private _done;
    private _resolve;
    /** Resolves on completion (forward end, or start when reversed). */
    finished: Promise<void>;
    /** Set when owned by a timeline (then the ticker never drives it). */
    parent: Timeline | null;
    constructor(o: PlayOptions);
    /** One iteration, ms. */
    abstract get duration(): number;
    /** Render at `ms` into one iteration. */
    protected abstract renderLocal(ms: number, iterationEnded: boolean): void;
    get totalDuration(): number;
    get time(): number;
    get progress(): number;
    set progress(p: number);
    get isActive(): boolean;
    get reversed(): boolean;
    /** Jump to `ms` (total time, including the delay) and render. */
    seek(ms: number): this;
    play(): this;
    pause(): this;
    /** Play backwards from the current time. */
    reverse(): this;
    restart(): this;
    /** Stop and detach for good. */
    kill(): void;
    /** Promise-like: `await tween(...)`. */
    then<R>(ok?: (v: void) => R, err?: (e: unknown) => R): Promise<R>;
    private attach;
    private advance;
    protected complete(): void;
}
/** Position: ms number, '<' (start of previous), '>' (end of previous, default), '+=200' / '-=200' (relative to the end), 'label', 'label+=100', '<+=100'. */
type Position = number | string;
interface TimelineOptions extends PlayOptions {
    /** Defaults merged into every `.to()`. */
    defaults?: Omit<TweenOptions, 'to' | 'from'>;
}
/** A sequence of tweens, nested timelines and callbacks. */
declare class Timeline extends Playable {
    private children;
    private labels;
    private prevStart;
    private prevEnd;
    private defaults;
    private lastLocal;
    constructor(o?: TimelineOptions);
    get duration(): number;
    private resolve;
    /** Add a tween, timeline or callback at a position. */
    add(item: Playable | (() => void), position?: Position): this;
    /** `tween(target, vars)` placed at `position` (stagger across several targets). */
    to(target: Target | Target[] | ArrayLike<Target>, vars: TweenOptions, position?: Position): this;
    call(fn: () => void, position?: Position): this;
    label(name: string, position?: Position): this;
    /** Time of a label, ms. */
    labelTime(name: string): number | undefined;
    remove(item: Playable): void;
    /** Children in start order (callbacks excluded). */
    getChildren(): Playable[];
    protected renderLocal(ms: number): void;
}

/**
 * Normalised keyframes shared by the format loaders: a list of frames with
 * offsets in [0, 1], camelCase props and an optional per-segment easing,
 * played as a runtime `Timeline` (one tween per segment).
 */

interface Frame {
    offset: number;
    props: Record<string, string | number>;
    /** Easing from this frame to the next. */
    easing?: string;
}

/**
 * `motionary/runtime/format-motion` (10.1) — play Motion / Framer-style
 * keyframe JSON with the runtime:
 *
 * ```json
 * { "initial": { "opacity": 0, "y": 40 },
 *   "animate": { "opacity": 1, "y": [40, -8, 0], "rotate": 0 },
 *   "transition": { "duration": 0.6, "ease": "easeOut", "times": [0, 0.7, 1], "delay": 0.1,
 *                   "repeat": 1, "repeatType": "reverse", "opacity": { "duration": 0.3 } } }
 * ```
 *
 * Supported: `initial` / `animate` (numbers, unit strings, colours, arrays as
 * keyframes), the transform shorthands `x y scale scaleX scaleY rotate skewX skewY`,
 * transition `duration` / `delay` (seconds) / `ease` (names or `[x1, y1, x2, y2]`) /
 * `times` / `repeat` (`Infinity` ok) / `repeatType` (`loop`, `reverse`, `mirror`),
 * per-property transitions, and `type: "spring"` (`stiffness`, `damping`, `mass`,
 * or `bounce` + `duration`) simulated into an easing curve.
 * Not supported: `layout`, gestures (`whileHover` …), variants propagation,
 * `staggerChildren` (use the runtime timeline `stagger`).
 */

type V = number | string;
interface MotionTransition {
    duration?: number;
    delay?: number;
    ease?: string | number[] | (string | number[])[];
    times?: number[];
    repeat?: number;
    repeatType?: 'loop' | 'reverse' | 'mirror';
    type?: 'tween' | 'spring' | 'keyframes' | 'inertia';
    stiffness?: number;
    damping?: number;
    mass?: number;
    bounce?: number;
    [prop: string]: unknown;
}
interface MotionDef {
    initial?: Record<string, V> | false;
    animate: Record<string, V | V[]>;
    transition?: MotionTransition;
}
/** A Motion ease → runtime ease. */
declare function motionEase(e: string | number[] | undefined): Ease;
/** Simulate a damped spring (unit step) → [ease, duration ms]. */
declare function springEase(o: {
    stiffness?: number;
    damping?: number;
    mass?: number;
    bounce?: number;
    duration?: number;
}): [Ease, number];
/** Motion def → one keyframe track per transition group (`[frames, transition]`). */
declare function fromMotion(def: MotionDef): {
    frames: Frame[];
    transition: MotionTransition;
    props: string[];
}[];
/**
 * Apply `initial` immediately and play `animate` with the transition.
 * Returns a runtime `Timeline` (one child per transition group), playing unless `paused`.
 */
declare function playMotion(target: Target, def: MotionDef, o?: {
    paused?: boolean;
}): Timeline;
interface FormatMotionApi {
    fromMotion: typeof fromMotion;
    playMotion: typeof playMotion;
    springEase: typeof springEase;
    motionEase: typeof motionEase;
}
/** The module object for `use(formatMotion)`. */
declare const formatMotion: RuntimeModule<FormatMotionApi>;

export { formatMotion, fromMotion, motionEase, playMotion, springEase };
export type { FormatMotionApi, MotionDef, MotionTransition };
