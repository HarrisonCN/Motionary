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
 * `motionary/runtime/scroll` (10.2) — scroll-linked scenes, an original
 * implementation: start / end rules, scrubbing (direct or smoothed), pinning,
 * debug markers, enter / leave callbacks and per-edge actions for a runtime
 * tween or timeline.
 *
 * ```ts
 * import { use, timeline } from 'motionary/runtime';
 * import { scroll, scrollScene } from 'motionary/runtime/scroll';
 * use(scroll);
 * const tl = timeline({ paused: true }).to('.card', { to: { x: 200, rotate: 8 } });
 * scrollScene({ trigger: '.section', start: 'top 80%', end: 'bottom 20%', scrub: 120, pin: true, markers: true, animation: tl });
 * ```
 *
 * Rules: `"<trigger edge> <viewport edge>"` where an edge is `top | center | bottom`,
 * a percentage or pixels, optionally `+=N` / `-=N` (e.g. `"top top+=80"`);
 * `end` may also be `"+=600"` (pixels after start). Horizontal scenes use
 * `left | center | right`. Nothing touches `window` until a scene is created.
 */

type SceneAction = 'play' | 'pause' | 'resume' | 'reverse' | 'restart' | 'reset' | 'complete' | 'none';
interface SceneOptions {
    /** Element (or selector) whose position defines the scene. */
    trigger: Element | string;
    /** Default 'top bottom' (trigger top meets viewport bottom). */
    start?: string;
    /** Default 'bottom top'. `'+=600'` = 600 px after start. */
    end?: string;
    /** Link the animation to the scroll position: `true` (direct) or a smoothing time in ms. */
    scrub?: boolean | number;
    /** Runtime tween / timeline (created `paused: true`). */
    animation?: Playable;
    /** Without scrub: actions on enter, leave, enter back, leave back. Default 'play none none reverse'. */
    actions?: string;
    /** Pin the trigger (or another element) while the scene is active. */
    pin?: boolean | Element | string;
    /** Show start / end markers (debugging). */
    markers?: boolean | {
        color?: string;
    };
    /** Class toggled on the trigger while active. */
    toggleClass?: string;
    /** Kill after the first forward completion. */
    once?: boolean;
    horizontal?: boolean;
    /** Scroll container (default: the window). */
    scroller?: Element | string;
    onEnter?: (s: ScrollScene) => void;
    onLeave?: (s: ScrollScene) => void;
    onEnterBack?: (s: ScrollScene) => void;
    onLeaveBack?: (s: ScrollScene) => void;
    onUpdate?: (s: ScrollScene) => void;
    onToggle?: (s: ScrollScene) => void;
}
/** One side of a rule ('top', '80%', '120px', 'center+=40') → pixels within `size`. */
declare function parseEdge(spec: string, size: number): number;
/** Scroll offset at which `rule` is met: trigger edge (at `triggerStart`, size `triggerSize`) meets viewport edge. */
declare function resolveRule(rule: string, triggerStart: number, triggerSize: number, viewport: number): number;
/** A scroll scene (see `scrollScene()`). */
declare class ScrollScene {
    readonly trigger: Element;
    readonly options: SceneOptions;
    /** Scroll offsets (px) of the start and end. */
    start: number;
    end: number;
    /** 0 → 1 between start and end. */
    progress: number;
    /** 1 scrolling forward, -1 back. */
    direction: number;
    isActive: boolean;
    private shown;
    private last;
    private offs;
    private pinEl;
    private spacer;
    private marks;
    private scroller;
    private killed;
    constructor(o: SceneOptions);
    private refreshBound;
    private pos;
    private viewport;
    /** Re-measure start / end (after layout changes). */
    refresh(): void;
    /** Read the scroll position and fire callbacks / drive the animation. */
    update(): void;
    private smooth;
    private act;
    private setupPin;
    private applyPin;
    private drawMarkers;
    /** Remove listeners, pin spacer and markers (`keepState` keeps the animation where it is). */
    kill(keepState?: boolean): void;
}
/** Create a scroll scene. */
declare function scrollScene(o: SceneOptions): ScrollScene;
/** Re-measure every scene (call after layout changes such as images loading). */
declare function refreshScenes(): void;
/** Kill every scene. */
declare function killScenes(): void;
/** The live scenes. */
declare const allScenes: () => ScrollScene[];
interface ScrollApi {
    scrollScene: typeof scrollScene;
    refreshScenes: typeof refreshScenes;
    killScenes: typeof killScenes;
    allScenes: typeof allScenes;
    parseEdge: typeof parseEdge;
    resolveRule: typeof resolveRule;
    ScrollScene: typeof ScrollScene;
}
/** The module object for `use(scroll)`. */
declare const scroll: RuntimeModule<ScrollApi>;

export { ScrollScene, allScenes, killScenes, parseEdge, refreshScenes, resolveRule, scroll, scrollScene };
export type { SceneAction, SceneOptions, ScrollApi };
