/** Easing functions (t ∈ [0, 1] → progress). Original implementations of the standard Penner-style curves. */
type Ease = (t: number) => number;
/** cubic-bezier(x1, y1, x2, y2), solved with Newton steps + bisection fallback. */
declare function cubicBezier(x1: number, y1: number, x2: number, y2: number): Ease;
/** steps(n, 'end' | 'start'). */
declare const steps: (n: number, pos?: "start" | "end") => Ease;
declare const EASES: Record<string, Ease>;
/** Resolve an ease: a function, a name ('cubic-out', 'ease-in-out', 'linear'), 'cubic-bezier(a,b,c,d)' or 'steps(n[, start|end])'. Unknown names throw. */
declare function parseEase(e?: string | Ease): Ease;

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
interface Num {
    kind: 'num';
    v: number;
    u: string;
}
interface Col {
    kind: 'col';
    c: number[];
}
/** Any other string: its numbers are interpolated when both ends share the same text around them. */
interface Str {
    kind: 'str';
    s: string;
    parts: string[];
    nums: number[];
}
type Val = Num | Col | Str;
/** Parse '12px', '-3.5', '50%', '#0af', 'rgb(1 2 3 / .5)', 'rgba(…)'. */
declare function parseValue(v: number | string): Val;
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
/** A tween of one target. */
declare class Tween extends Playable {
    readonly target: Target;
    private _dur;
    private ease;
    private tracks;
    private toProps;
    private fromProps;
    constructor(target: Target, o: TweenOptions);
    get duration(): number;
    /** Capture start values (first render). */
    private init;
    protected renderLocal(ms: number, ended: boolean): void;
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
/** A new timeline (plays on the next frame unless `paused`). */
declare function timeline(o?: TimelineOptions): Timeline;

/**
 * Module registry shared by every copy of `motionary/runtime` on the page
 * (ESM, CJS and the CDN IIFE builds all read the same `globalThis` slot),
 * so a component never needs to import the runtime itself — it asks for a
 * module with `requireModule()` and gets a clear error when it is missing.
 * Nothing here touches `window` / `document`: safe to import during SSR and
 * inside Web Workers.
 */
/** Runtime version (kept in sync with the package version by the release script). */
declare const RUNTIME_VERSION = "13.0.1";
/** Where the CDN builds live (major-pinned). */
declare const RUNTIME_CDN = "https://cdn.jsdelivr.net/npm/motionary@13/dist/";
/**
 * 11.4: runtime tiers. **basic** — ticker, tween, timeline, scroll, text, CSS / WAAPI keyframes; **standard** — smooth
 * scrolling, drag-snap, SVG, sprites, GIF / APNG / WebP, Lottie; **advanced** — WebGL, 3D file parsing and decoders,
 * physics. A page that only uses basic modules never downloads standard or advanced code.
 */
type RuntimeTier = 'basic' | 'standard' | 'advanced';
declare const TIER_ORDER: readonly RuntimeTier[];
/** The tier of every runtime module id (and of the optional peer runtimes components can use). */
declare const RUNTIME_TIERS: Readonly<Record<string, RuntimeTier>>;
/** The tier of a module id (`undefined` for an unknown id). */
declare const tierOf: (id: string) => RuntimeTier | undefined;
/** The highest tier among module ids — what a component that requires them costs (`basic` for none). */
declare function maxTier(ids?: readonly string[]): RuntimeTier;
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
/** The page-wide registry (created on first use). */
declare function registry(): RuntimeRegistry;
/** The import path of a module id. */
declare const modulePath: (id: string) => string;
/** The CDN IIFE file of a module id. */
declare const moduleCdn: (id: string) => string;
/** The text of the "module missing" error (shared with the components). */
declare function missingMessage(id: string, who?: string): string;
/** Thrown by `requireModule()` when a module is not registered. */
declare class RuntimeModuleError extends Error {
    readonly module: string;
    constructor(id: string, who?: string);
}
/** Register modules (each once; re-registering the same id keeps the first). Returns the registry. */
declare function register(...mods: RuntimeModule[]): RuntimeRegistry;
/** Is a module registered? */
declare const hasModule: (id: string) => boolean;
/** The API of a registered module, or a `RuntimeModuleError` with install / import / CDN instructions. */
declare function requireModule<A = unknown>(id: string, who?: string): A;
/** Ids of the registered modules. */
declare const registeredModules: () => string[];

type TickFn = (time: number, delta: number) => void;
interface Ticker {
    /** Add a listener; returns a remover. */
    add(fn: TickFn): () => void;
    remove(fn: TickFn): void;
    /** ms since the ticker started (frozen while sleeping). */
    readonly time: number;
    /** Smoothed frames per second. */
    readonly fps: number;
    /** Listener count (0 = asleep). */
    readonly size: number;
    /** Cap a single frame's delta (default 100 ms) so a background tab does not jump animations. */
    lagSmoothing(maxDelta: number): void;
    /** Global time scale (1 = normal, 0.5 = half speed, 0 = frozen). */
    timeScale: number;
    /** Advance by `ms` synchronously (tests, offline rendering, worker loops). */
    step(ms: number): void;
}
/** The page-wide ticker (shared across every copy of the runtime). */
declare function getTicker(): Ticker;

/** The core module's API (what `requireModule('core')` returns). */
interface CoreApi {
    version: string;
    getTicker: typeof getTicker;
    tween: (target: any, o: TweenOptions) => Playable;
    timeline: typeof timeline;
    Tween: typeof Tween;
    Timeline: typeof Timeline;
    EASES: typeof EASES;
    parseEase: typeof parseEase;
    cubicBezier: typeof cubicBezier;
    steps: typeof steps;
}
/** The core as a module object. */
declare const core: RuntimeModule<CoreApi>;
/** Tween targets (objects, elements, lists or a CSS selector). See `TweenOptions`. */
declare function tween(target: any, o: TweenOptions): Playable;
/** Selector strings become element lists (only where `document` exists). */
declare function resolveTargets(t: any): any;
/**
 * Register the core plus any modules (`use(formatCss, formatMotion)`).
 * Call once at start-up, before runtime-powered components mount.
 */
declare function use(...mods: RuntimeModule[]): RuntimeRegistry;

export { EASES, Playable, RUNTIME_CDN, RUNTIME_TIERS, RUNTIME_VERSION, RuntimeModuleError, TIER_ORDER, Timeline, Tween, core, cubicBezier, getTicker, hasModule, maxTier, missingMessage, moduleCdn, modulePath, parseEase, parseValue, register, registeredModules, registry, requireModule, resolveTargets, steps, tierOf, timeline, tween, use };
export type { CoreApi, Ease, PlayOptions, Position, Props, RuntimeModule, RuntimeRegistry, RuntimeTier, Target, TickFn, Ticker, TimelineOptions, TweenOptions };
