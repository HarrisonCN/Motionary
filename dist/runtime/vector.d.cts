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
 * `motionary/runtime/vector` (10.6) — a Lottie (bodymovin JSON) + dotLottie
 * player written for Motionary (own renderer on Canvas 2D; no lottie-web
 * code). Supported subset — see the compatibility table in
 * `docs/runtime/vector.md`:
 *
 * - layers: shape, solid, null, image, precomp (with time stretch / time
 *   remap), parenting, in / out points, hidden layers;
 * - transforms: anchor, position (incl. split X / Y and spatial bezier
 *   paths), scale, rotation, skew, opacity;
 * - shapes: groups, paths, rectangles (rounded), ellipses, stars / polygons;
 *   fills (non-zero / even-odd), strokes (caps, joins, dashes), linear and
 *   radial gradient fills / strokes, **trim paths** (individually /
 *   simultaneously);
 * - **masks** (add, subtract, intersect, inverted, opacity) and **track
 *   mattes** (alpha, alpha inverted; luma approximated by alpha);
 * - keyframes: bezier easing per dimension, hold keyframes, v4 (`e`) and v5+
 *   (`s` only) files;
 * - **dotLottie** (`.lottie`): zip (stored + deflate via the native
 *   `DecompressionStream`; 11.0: entry-count / size / ratio limits enforced
 *   while inflating — `ZipLimits`, `ZIP_LIMITS`), `manifest.json` v1 / v2, several animations,
 *   embedded images.
 *
 * 10.8: **text layers** (system / web fonts by family + style, justification,
 * tracking, line height, fill + stroke, box text with wrapping, source-text
 * keyframes and expressions) and an **expression subset** (see
 * `lottie-expr.ts`: time, value, wiggle, loopOut / loopIn, linear / ease,
 * Math…; no eval). Not supported (documented): 3D layers, effects, text
 * animators, glyph outlines (`chars`), merge paths, repeaters. `lottiePlayer()` is a
 * runtime timeline (seek, reverse, scrub with `progress`, markers → labels).
 */

type Num = number;
interface LottieProp {
    a?: Num;
    k: any;
    x?: string;
    s?: boolean;
}
interface LottieLayer {
    t?: any;
    ty: Num;
    ind?: Num;
    parent?: Num;
    ip: Num;
    op: Num;
    st?: Num;
    sr?: Num;
    ks: any;
    shapes?: any[];
    hd?: boolean;
    tt?: Num;
    td?: Num;
    masksProperties?: any[];
    refId?: string;
    w?: Num;
    h?: Num;
    sw?: Num;
    sh?: Num;
    sc?: string;
    tm?: LottieProp;
    nm?: string;
    ddd?: Num;
    ef?: unknown[];
}
interface LottieAnimation {
    v?: string;
    fr: Num;
    ip: Num;
    op: Num;
    w: Num;
    h: Num;
    nm?: string;
    layers: LottieLayer[];
    assets?: {
        id: string;
        layers?: LottieLayer[];
        p?: string;
        u?: string;
        w?: Num;
        h?: Num;
        e?: Num;
    }[];
    markers?: {
        cm: string;
        tm: Num;
        dr: Num;
    }[];
    fonts?: {
        list?: {
            fName: string;
            fFamily?: string;
            fStyle?: string;
        }[];
    };
    chars?: unknown[];
}
/** What the renderer skipped in a file (shown by `inspectLottie()`). */
interface LottieReport {
    layers: Num;
    unsupported: string[];
}
/** Value of an (animated or static) property at frame `f` (10.8: with its expression applied). */
declare function propValue(p: LottieProp | undefined, f: Num, fallback?: any): any;
type M = [Num, Num, Num, Num, Num, Num];
/** Transform matrix + opacity (0–1) of a `ks` / `tr` block at frame f. */
declare function transformAt(ks: any, f: Num): {
    m: M;
    o: Num;
};
/** A path as absolute cubic segments: contours of [x0,y0, (c1x,c1y,c2x,c2y,x,y)…], closed flag. */
interface Contour {
    pts: Num[];
    closed: boolean;
}
/** Apply trim paths to contours ('simultaneously' = per contour, 'individually' = along all of them). */
declare function trimContours(cs: Contour[], start: Num, end: Num, offset: Num, mode: Num): Contour[];
type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
interface RenderOptions {
    /** Images for image layers / assets by asset id. */
    images?: Record<string, CanvasImageSource>;
}
/** Render one frame onto a 2D context sized `width × height` (the animation is fitted with `fit`). */
declare function renderLottieFrame(ctx: Ctx, anim: LottieAnimation, frame: Num, o?: RenderOptions & {
    fit?: 'contain' | 'cover' | 'fill';
    width?: Num;
    height?: Num;
    background?: string;
}): void;
/** List what a file uses that this renderer skips (3D layers, effects, text, expressions, merge paths, repeaters…). */
declare function inspectLottie(anim: LottieAnimation): LottieReport;
interface ZipEntry {
    name: string;
    method: Num;
    data: Uint8Array;
    size: Num;
}
/**
 * 11.0: limits for reading untrusted zip / `.lottie` archives (zip-bomb protection). Enforced while inflating —
 * declared sizes are never trusted; inflating stops as soon as a limit is crossed.
 */
interface ZipLimits {
    /** Max entries in the archive (default 1000). */
    maxEntries?: Num;
    /** Max uncompressed bytes of one entry (default 32 MB). */
    maxEntryBytes?: Num;
    /** Max uncompressed bytes of the whole archive (default 64 MB). */
    maxTotalBytes?: Num;
    /** Max uncompressed / compressed ratio of an entry once it is past 1 MB (default 100). */
    maxRatio?: Num;
}
declare const ZIP_LIMITS: Readonly<Required<ZipLimits>>;
/** Read a zip archive's entries (central directory; stored + deflate). Pure; inflating uses `DecompressionStream`. */
declare function unzipEntries(input: ArrayBuffer | Uint8Array, limits?: ZipLimits): ZipEntry[];
/** Inflate one entry, counting the real output against `limits`; `used` is shared across one archive. */
declare function inflateEntry(e: ZipEntry, limits?: ZipLimits, used?: {
    total: number;
}): Promise<Uint8Array>;
interface DotLottie {
    manifest: any;
    animations: Record<string, LottieAnimation>;
    /** Image bytes by file name inside the archive's `images/` (v1) or `i/` (v2) folder — the asset `p` an animation references. */
    images: Record<string, Uint8Array>;
    themes: Record<string, unknown>;
    stateMachines: Record<string, unknown>;
}
/** Unpack a `.lottie` (dotLottie v1 or v2). 11.0: `limits` (zip-bomb protection, safe defaults in `ZIP_LIMITS`). */
declare function parseDotLottie(input: ArrayBuffer | Uint8Array, o?: {
    limits?: ZipLimits;
}): Promise<DotLottie>;
/** Decode the images an animation references (embedded data URIs, dotLottie images, or URLs relative to `base`). */
declare function loadLottieImages(anim: LottieAnimation, o?: {
    files?: Record<string, Uint8Array>;
    base?: string;
}): Promise<Record<string, CanvasImageSource>>;
/** Fetch a `.json` Lottie or a `.lottie` file. `animation` picks one of several in a dotLottie (default: the manifest's first / active one). */
declare function loadLottie(src: string | ArrayBuffer | Uint8Array, o?: {
    animation?: string;
    base?: string;
    limits?: ZipLimits;
}): Promise<{
    animation: LottieAnimation;
    images: Record<string, CanvasImageSource>;
    dotLottie: DotLottie | null;
}>;
interface LottiePlayerOptions extends RenderOptions {
    loop?: boolean | Num;
    autoplay?: boolean;
    speed?: Num;
    /** Play forward then backward. */
    bounce?: boolean;
    fit?: 'contain' | 'cover' | 'fill';
    background?: string;
    /** Segment [fromFrame, toFrame] or a marker name. */
    segment?: [Num, Num] | string;
}
type LottiePlayer = Playable & {
    readonly frame: Num;
    readonly totalFrames: Num;
    readonly animation: LottieAnimation;
    goToFrame(f: Num): void;
    setSegment(seg: [Num, Num] | string | null): void;
    markers: Record<string, [Num, Num]>;
};
/** Play a Lottie animation on a canvas as a runtime timeline. */
declare function lottiePlayer(canvas: HTMLCanvasElement | OffscreenCanvas, animation: LottieAnimation, o?: LottiePlayerOptions): LottiePlayer;
/** Evaluate a Lottie expression (10.8 subset) on a value at `time` seconds — `undefined` when it is outside the subset. */
declare function evalExpression(src: string, value: any, time?: number, fr?: number): any;
interface VectorApi {
    evalExpression: typeof evalExpression;
    loadLottie: typeof loadLottie;
    parseDotLottie: typeof parseDotLottie;
    unzipEntries: typeof unzipEntries;
    lottiePlayer: typeof lottiePlayer;
    renderLottieFrame: typeof renderLottieFrame;
    inspectLottie: typeof inspectLottie;
    propValue: typeof propValue;
    transformAt: typeof transformAt;
    trimContours: typeof trimContours;
    loadLottieImages: typeof loadLottieImages;
}
/** The module object for `use(vector)`. */
declare const vector: RuntimeModule<VectorApi>;

export { ZIP_LIMITS, evalExpression, inflateEntry, inspectLottie, loadLottie, loadLottieImages, lottiePlayer, parseDotLottie, propValue, renderLottieFrame, transformAt, trimContours, unzipEntries, vector };
export type { DotLottie, LottieAnimation, LottieLayer, LottiePlayer, LottiePlayerOptions, LottieProp, LottieReport, RenderOptions, VectorApi, ZipEntry, ZipLimits };
