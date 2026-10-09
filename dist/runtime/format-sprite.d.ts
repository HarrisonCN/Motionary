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
 * `motionary/runtime/format-sprite` (10.3) — sprite sheets and image
 * sequences on the runtime timeline (original implementation).
 *
 * - `parseSpriteSheet(json)` — TexturePacker JSON (hash and array), Aseprite
 *   JSON (hash and array, per-frame `duration`, `meta.frameTags` with
 *   `forward` / `reverse` / `pingpong` directions) and the generic
 *   `{ frames: [{ x, y, w, h }] }` shape; trimmed frames (`spriteSourceSize` /
 *   `sourceSize`) and rotated frames are supported.
 * - `gridSheet(cols, rows, w, h, n?)` — a plain grid sheet.
 * - `frameOrder(sheet, tag?)` — the playback order of a tag (pingpong without repeating the ends).
 * - `spritePlayer(target, sheet, image, { tag, fps })` — a runtime `Playable`
 *   that draws frames onto a `<canvas>` or moves the background of an element.
 * - `imageSequence('frame_{0001}.webp', { start, end })`, `preloadImages(urls)`,
 *   `sequencePlayer(canvas, images, { fps })` — numbered image sequences,
 *   scrubbable (`player.progress = p`, e.g. from a scroll scene).
 * Parsing works without the DOM (SSR / workers); players need a canvas / element.
 */

interface SpriteFrame {
    name: string;
    x: number;
    y: number;
    w: number;
    h: number;
    rotated: boolean;
    /** Offset of the trimmed frame inside the original (untrimmed) size. */
    offsetX: number;
    offsetY: number;
    sourceW: number;
    sourceH: number;
    /** ms (Aseprite), or undefined (use the player's fps). */
    duration?: number;
}
interface SpriteTag {
    name: string;
    from: number;
    to: number;
    direction: 'forward' | 'reverse' | 'pingpong' | 'pingpong_reverse';
}
interface SpriteSheet {
    frames: SpriteFrame[];
    tags: SpriteTag[];
    image?: string;
    size?: {
        w: number;
        h: number;
    };
    format: 'texturepacker' | 'aseprite' | 'generic';
}
/** Parse a sprite-sheet JSON (object or string). */
declare function parseSpriteSheet(input: string | Record<string, any>): SpriteSheet;
/** A grid sheet: `cols × rows` cells of `w × h` (first `n` cells). */
declare function gridSheet(cols: number, rows: number, w: number, h: number, n?: number): SpriteSheet;
/** Frame indices for a tag (or the whole sheet). */
declare function frameOrder(sheet: SpriteSheet, tag?: string): number[];
/** Draw one frame onto a 2D context at (dx, dy), honouring trim offsets and rotation. */
declare function drawFrame(ctx: CanvasRenderingContext2D, image: CanvasImageSource, f: SpriteFrame, dx?: number, dy?: number, scale?: number): void;
interface SpritePlayerOptions {
    tag?: string;
    /** Frames per second for frames without their own duration (default 12). */
    fps?: number;
    repeat?: number;
    yoyo?: boolean;
    paused?: boolean;
    /** Canvas only: draw scale (default: fit the canvas width). */
    scale?: number;
}
/** Play a sprite sheet on a canvas (image = loaded image / bitmap) or an element's background (image = URL). */
declare function spritePlayer(target: HTMLCanvasElement | HTMLElement, sheet: SpriteSheet, image: CanvasImageSource | string, o?: SpritePlayerOptions): Playable & {
    readonly frame: number;
};
/** 'frame_{0001}.webp' + { start: 1, end: 3 } → frame_0001.webp, frame_0002.webp, frame_0003.webp ('{1}' = no padding). */
declare function imageSequence(pattern: string, o: {
    start?: number;
    end: number;
    step?: number;
}): string[];
/** Load images (resolves when all are decoded; rejects with the failing URL). */
declare function preloadImages(urls: string[]): Promise<HTMLImageElement[]>;
/** Play (or scrub, via `progress`) an image sequence on a canvas, `object-fit: cover` style. */
declare function sequencePlayer(canvas: HTMLCanvasElement, images: CanvasImageSource[], o?: {
    fps?: number;
    repeat?: number;
    yoyo?: boolean;
    paused?: boolean;
}): Playable & {
    readonly frame: number;
};
interface FormatSpriteApi {
    parseSpriteSheet: typeof parseSpriteSheet;
    gridSheet: typeof gridSheet;
    frameOrder: typeof frameOrder;
    drawFrame: typeof drawFrame;
    spritePlayer: typeof spritePlayer;
    imageSequence: typeof imageSequence;
    preloadImages: typeof preloadImages;
    sequencePlayer: typeof sequencePlayer;
}
/** The module object for `use(formatSprite)`. */
declare const formatSprite: RuntimeModule<FormatSpriteApi>;

export { drawFrame, formatSprite, frameOrder, gridSheet, imageSequence, parseSpriteSheet, preloadImages, sequencePlayer, spritePlayer };
export type { FormatSpriteApi, SpriteFrame, SpritePlayerOptions, SpriteSheet, SpriteTag };
