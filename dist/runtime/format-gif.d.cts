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
 * Shared internals of the animated-image loaders (`format-gif`, `format-apng`,
 * `format-webp`, 10.4): the decoded-animation shape, frame compositing in
 * plain RGBA arrays (no DOM — works in workers and on the server), the
 * browser image decoder used for APNG / WebP frames, and the canvas player
 * (a runtime `Playable`, so it can be paused, reversed, scrubbed and driven
 * by a scroll scene). Bundled into each loader; not a public module.
 */

/** An RGBA bitmap (the shape of `ImageData`, without needing the DOM). */
interface Rgba {
    width: number;
    height: number;
    data: Uint8ClampedArray;
}
/** One frame of an animation, already composited to the full canvas size. */
interface AnimFrame {
    /** Display time, ms. */
    delay: number;
    image: Rgba;
}
interface AnimatedImage {
    format: 'gif' | 'apng' | 'webp';
    width: number;
    height: number;
    /** Number of plays: 0 = forever, 1 = once, … */
    plays: number;
    frames: AnimFrame[];
}
/** A frame region before compositing (APNG fcTL / WebP ANMF / GIF descriptor). */
interface FramePart {
    x: number;
    y: number;
    image: Rgba;
    delay: number;
    /** 'over' alpha-blends onto the canvas, 'source' replaces the region. */
    blend: 'over' | 'source';
    /** What happens to the region after the frame is shown. */
    dispose: 'none' | 'background' | 'previous';
}
/** Composite frame parts onto a `width × height` canvas (pure; RGBA in, RGBA out). */
declare function composeFrames(width: number, height: number, parts: FramePart[], background?: [number, number, number, number]): AnimFrame[];
interface AnimPlayerOptions {
    /** Extra repeats; default from the file (`plays`: 0 → forever). */
    repeat?: number;
    yoyo?: boolean;
    paused?: boolean;
    /** Playback speed (default 1). */
    speed?: number;
}
type AnimPlayer = Playable & {
    readonly frame: number;
    readonly frameCount: number;
};
/** Play a decoded animation on a canvas as a runtime timeline (seek / reverse / `progress` scrub). */
declare function animatedImagePlayer(canvas: HTMLCanvasElement | OffscreenCanvas, anim: AnimatedImage, o?: AnimPlayerOptions): AnimPlayer;

/**
 * `motionary/runtime/format-gif` (10.4) — a complete GIF decoder written for
 * Motionary (own LZW implementation, no dependencies, no DOM): GIF87a / GIF89a,
 * global and local palettes, transparency, interlaced frames, disposal
 * methods 0–3, per-frame delays and the NETSCAPE2.0 loop count. Frames are
 * composited to full-size RGBA, so they can be drawn, scrubbed or reversed
 * with `animatedImagePlayer()` (a runtime timeline).
 *
 * ```ts
 * import { use } from 'motionary/runtime';
 * import { formatGif, loadGif, animatedImagePlayer } from 'motionary/runtime/format-gif';
 * use(formatGif);
 * const gif = await loadGif('/loader.gif');
 * const player = animatedImagePlayer(canvas, gif);   // player.pause(); player.progress = 0.5
 * ```
 */

/** LZW-decode GIF image data into palette indices (exported for tests / tools). */
declare function lzwDecode(minCodeSize: number, data: Uint8Array, pixelCount: number): Uint8Array;
interface GifInfo {
    version: '87a' | '89a';
    width: number;
    height: number;
    /** NETSCAPE2.0 loop count (0 = forever), or null when the file has none (plays once). */
    loopCount: number | null;
    frameCount: number;
}
/** Decode a GIF (bytes) into composited RGBA frames. Pure: no DOM, works in workers / Node. */
declare function decodeGif(input: Uint8Array | ArrayBuffer): AnimatedImage & {
    info: GifInfo;
};
/** Fetch (URL) or read (ArrayBuffer / Blob / bytes) and decode a GIF. */
declare function loadGif(src: string | ArrayBuffer | ArrayBufferView | Blob): Promise<AnimatedImage & {
    info: GifInfo;
}>;
interface FormatGifApi {
    decodeGif: typeof decodeGif;
    loadGif: typeof loadGif;
    lzwDecode: typeof lzwDecode;
    animatedImagePlayer: typeof animatedImagePlayer;
}
/** The module object for `use(formatGif)`. */
declare const formatGif: RuntimeModule<FormatGifApi>;

export { animatedImagePlayer, composeFrames, decodeGif, formatGif, loadGif, lzwDecode };
export type { AnimFrame, AnimPlayer, AnimPlayerOptions, AnimatedImage, FormatGifApi, GifInfo, Rgba };
