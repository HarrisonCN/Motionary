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
 * `motionary/runtime/format-svg` (10.2) — SVG animation with the runtime
 * (original implementation):
 *
 * - **Path geometry** without the DOM (SSR / workers): `parsePath(d)` (all
 *   commands, relative + absolute, arcs), `flattenPath(d)`, `pathLength(d)`,
 *   `pointAtLength(d, len)`, `samplePath(d, n)`.
 * - **Path morphing**: `morphPath(from, to, { points })` → `(p) => d` — both
 *   paths are resampled to the same number of points (any command mix, any
 *   point counts), aligned to the closest start point, then interpolated.
 * - **SMIL playback**: `playSmil(svg)` reads `<animate>`, `<set>`,
 *   `<animateTransform>` (translate / scale / rotate / skewX / skewY) and
 *   `<animateMotion>` (`path` or `<mpath>`, `rotate="auto"`) — `from` / `to` /
 *   `by` / `values`, `keyTimes`, `keySplines` (`calcMode="spline"`),
 *   `calcMode="discrete"`, `dur`, numeric `begin` offsets, `repeatCount`
 *   (incl. `indefinite`), `fill="freeze"` — and replays them as a runtime
 *   timeline (seek, scrub, reverse, timeScale) instead of the browser's SMIL clock.
 * - CSS-animated SVG: use `motionary/runtime/format-css` (`@keyframes` in the SVG's `<style>`).
 *
 * Not supported (documented): event / syncbase `begin` values (`click`,
 * `a.end`), `accumulate` / `additive="sum"`, `<animateColor>` (deprecated).
 */

type Pt = [number, number];
type PathCommand = [string, ...number[]];
/** Parse path data into absolute commands (M L C Q A Z; H/V/S/T expanded). */
declare function parsePath(d: string): PathCommand[];
/** Flatten a path into polylines (one per subpath); `segments` points per curve. */
declare function flattenPath(d: string | PathCommand[], segments?: number): Pt[][];
/** Total length of a path. */
declare function pathLength(d: string | PathCommand[]): number;
/** Point (and tangent angle, degrees) at a distance along the path. */
declare function pointAtLength(d: string | PathCommand[], len: number): {
    x: number;
    y: number;
    angle: number;
};
/** `n` points evenly spaced along the path (all subpaths joined). */
declare function samplePath(d: string | PathCommand[], n?: number): Pt[];
/**
 * Morph between two paths of any shape: `const f = morphPath(a, b); el.setAttribute('d', f(0.5))`.
 * Closed paths are rotated so their start points line up (less twisting).
 */
declare function morphPath(from: string, to: string, o?: {
    points?: number;
}): (p: number) => string;
/** '2s', '150ms', '1.5', 'indefinite' → ms (NaN for indefinite / unsupported). */
declare function smilTime(v: string | null | undefined): number;
interface SmilAnimationInfo {
    kind: 'animate' | 'set' | 'animateTransform' | 'animateMotion';
    target: Element;
    attribute: string;
    begin: number;
    dur: number;
    repeat: number;
    freeze: boolean;
    values: string[];
    keyTimes: number[];
    calcMode: string;
    type?: string;
}
/** Read the SMIL animation elements of an SVG (without playing them). */
declare function readSmil(svg: Element): SmilAnimationInfo[];
interface SmilPlayer {
    timeline: Timeline;
    animations: SmilAnimationInfo[];
    /** Put the original SMIL elements back (the browser's clock takes over again). */
    restore(): void;
}
/**
 * Replay an SVG's SMIL animations with the runtime. The SMIL elements are
 * detached while the runtime drives the attributes (call `restore()` to put
 * them back). Playing unless `paused: true`.
 */
declare function playSmil(svg: Element, o?: {
    paused?: boolean;
    timeScale?: number;
}): SmilPlayer;
interface FormatSvgApi {
    parsePath: typeof parsePath;
    flattenPath: typeof flattenPath;
    pathLength: typeof pathLength;
    pointAtLength: typeof pointAtLength;
    samplePath: typeof samplePath;
    morphPath: typeof morphPath;
    readSmil: typeof readSmil;
    playSmil: typeof playSmil;
    smilTime: typeof smilTime;
}
/** The module object for `use(formatSvg)`. */
declare const formatSvg: RuntimeModule<FormatSvgApi>;

export { flattenPath, formatSvg, morphPath, parsePath, pathLength, playSmil, pointAtLength, readSmil, samplePath, smilTime };
export type { FormatSvgApi, PathCommand, SmilAnimationInfo, SmilPlayer };
