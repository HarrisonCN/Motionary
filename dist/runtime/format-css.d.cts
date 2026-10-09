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

/** A runtime module: `{ id, version, api }`, registered with `use()`. */
interface RuntimeModule<A = unknown> {
    /** Module id: 'core', 'format-css', 'scroll', … (import path `motionary/runtime/<id>`). */
    id: string;
    version: string;
    /** Other modules this one needs (registered first by `use()` callers). */
    requires?: string[];
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
interface KeyframesPlayOptions extends PlayOptions {
    /** ms (default 1000). */
    duration?: number;
    /** Default easing for segments without their own (default 'linear', as in CSS / WAAPI keyframes). */
    ease?: string | Ease;
}

interface KeyframesDef {
    name: string;
    frames: Frame[];
}
/** Parse the body of one `@keyframes` block. */
declare function parseKeyframesBody(body: string): Frame[];
/** Every `@keyframes` block in a stylesheet's text. */
declare function parseKeyframes(cssText: string): KeyframesDef[];
/** A live `CSSKeyframesRule` (e.g. from `document.styleSheets`). */
declare function fromCssRule(rule: {
    name: string;
    cssText: string;
}): KeyframesDef;
type WaapiFrame = Record<string, unknown> & {
    offset?: number | null;
    easing?: string;
};
/** WAAPI keyframes (array or property-indexed form) → frames. */
declare function fromWaapi(kf: WaapiFrame[] | Record<string, unknown>): Frame[];
/** Frames in WAAPI array form (for `element.animate()`). */
declare function toWaapi(frames: Frame[]): Keyframe[];
/** Play frames (or a `KeyframesDef`) on a target. Returns the runtime timeline (playing unless `paused: true`). */
declare function playKeyframes(target: Target, frames: Frame[] | KeyframesDef, o?: KeyframesPlayOptions): Timeline;
interface FormatCssApi {
    parseKeyframes: typeof parseKeyframes;
    fromCssRule: typeof fromCssRule;
    fromWaapi: typeof fromWaapi;
    toWaapi: typeof toWaapi;
    playKeyframes: typeof playKeyframes;
}
/** The module object for `use(formatCss)`. */
declare const formatCss: RuntimeModule<FormatCssApi>;

export { formatCss, fromCssRule, fromWaapi, parseKeyframes, parseKeyframesBody, playKeyframes, toWaapi };
export type { FormatCssApi, Frame, KeyframesDef, KeyframesPlayOptions };
