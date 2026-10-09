/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
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
 *   `DecompressionStream`), `manifest.json` v1 / v2, several animations,
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

type Num$1 = number;
interface LottieProp {
    a?: Num$1;
    k: any;
    x?: string;
    s?: boolean;
}
interface LottieLayer {
    t?: any;
    ty: Num$1;
    ind?: Num$1;
    parent?: Num$1;
    ip: Num$1;
    op: Num$1;
    st?: Num$1;
    sr?: Num$1;
    ks: any;
    shapes?: any[];
    hd?: boolean;
    tt?: Num$1;
    td?: Num$1;
    masksProperties?: any[];
    refId?: string;
    w?: Num$1;
    h?: Num$1;
    sw?: Num$1;
    sh?: Num$1;
    sc?: string;
    tm?: LottieProp;
    nm?: string;
    ddd?: Num$1;
    ef?: unknown[];
}
interface LottieAnimation {
    v?: string;
    fr: Num$1;
    ip: Num$1;
    op: Num$1;
    w: Num$1;
    h: Num$1;
    nm?: string;
    layers: LottieLayer[];
    assets?: {
        id: string;
        layers?: LottieLayer[];
        p?: string;
        u?: string;
        w?: Num$1;
        h?: Num$1;
        e?: Num$1;
    }[];
    markers?: {
        cm: string;
        tm: Num$1;
        dr: Num$1;
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
type LottiePlayer = Playable & {
    readonly frame: Num$1;
    readonly totalFrames: Num$1;
    readonly animation: LottieAnimation;
    goToFrame(f: Num$1): void;
    setSegment(seg: [Num$1, Num$1] | string | null): void;
    markers: Record<string, [Num$1, Num$1]>;
};

/**
 * `<usa-lottie-player src="hero.lottie" autoplay loop></usa-lottie-player>`
 * (10.6) — plays Lottie JSON and dotLottie (`.lottie`) files with
 * **`motionary/runtime/vector`** (requires `use(vector)`): Motionary's own
 * Canvas 2D renderer for the documented subset (shapes, gradients, trim
 * paths, masks, track mattes, precomps, images). `animation` (id inside a
 * dotLottie), `autoplay`, `loop` (or a count), `speed`, `mode` (normal ·
 * bounce), `segment` ("0,30" or a marker name), `hover` (play on hover),
 * `scrub` (progress follows the element's scroll position), `fit` (contain ·
 * cover · fill), `background`, `label`. Methods `play()`, `pause()`,
 * `stop()`, `seek(frame)`, `player`, `animationData`, `unsupported`
 * (features in the file this renderer skips); `usa:load`, `usa:complete`,
 * `usa:error`. Reduced motion: first frame, no autoplay. Renders only while
 * visible.
 */
interface UsaLottiePlayerElement extends UsaElement {
    play(): void;
    pause(): void;
    stop(): void;
    seek(frame: number): void;
    readonly player: LottiePlayer | null;
    readonly animationData: LottieAnimation | null;
    readonly unsupported: string[];
}

/**
 * `motionary/runtime/lottie-state` (10.9) — dotLottie **themes** (slots) and a
 * **state machine subset** for `motionary/runtime/vector` (own
 * implementation; requires `use(vector, lottieState)`).
 *
 * Themes: Lottie slots (`"sid"` on a property + the animation's `slots`)
 * and dotLottie theme files (`t/<id>.json`, rules of type Color · Scalar ·
 * Vector / Position · Text, static `value` or `keyframes`, optionally limited
 * to some `animations`) → `applyTheme(animation, theme)` returns a themed copy
 * the vector renderer plays as is.
 *
 * State machines (dotLottie `s/<id>.json`, subset): `initial`, PlaybackState
 * and GlobalState states (animation, autoplay, loop, speed, mode, marker
 * segment, entry / exit actions), transitions nested in states or top-level
 * (`fromState`), guards on Numeric / String / Boolean inputs (Equal,
 * NotEqual, GreaterThan(OrEqual), LessThan(OrEqual)) and Events,
 * interactions PointerDown / PointerUp / PointerEnter / PointerExit / Click /
 * OnComplete / OnLoopComplete, actions Fire, SetNumeric / SetString /
 * SetBoolean, Toggle, Increment, Decrement, Reset, SetTheme, SetFrame,
 * SetProgress, FireCustomEvent. **OpenUrl is not supported** (a file must not
 * navigate the page); `inspectStateMachine()` lists anything skipped.
 * Pure (no DOM); `<usa-lottie-player theme state-machine>` wires it up.
 */

type Num = number;
type Any = any;
interface SmGuard {
    type: 'Numeric' | 'String' | 'Boolean' | 'Event';
    inputName: string;
    conditionType?: string;
    compareTo?: Any;
}
interface SmTransition {
    type?: string;
    fromState?: string;
    toState: string;
    guards?: SmGuard[];
}
interface SmAction {
    type: string;
    inputName?: string;
    value?: Any;
    themeId?: string;
}
interface SmState {
    name: string;
    type?: 'PlaybackState' | 'GlobalState' | string;
    animation?: string;
    autoplay?: boolean;
    loop?: boolean;
    loopCount?: Num;
    speed?: Num;
    mode?: 'Forward' | 'Reverse' | 'Bounce' | 'ReverseBounce' | string;
    segment?: string;
    transitions?: SmTransition[];
    entryActions?: SmAction[];
    exitActions?: SmAction[];
}
interface StateMachine {
    readonly state: SmState;
    readonly inputs: Record<string, Any>;
    fire(event: string): void;
    set(name: string, value: Any): void;
    /** Feed an interaction (PointerDown, Click, OnComplete …); `layerName` filters interactions bound to a layer. */
    interact(type: string, layerName?: string): void;
    reset(): void;
}

/**
 * `<usa-dotlottie src="button.lottie" state-machine="toggle"></usa-dotlottie>`
 * (10.9) — `<usa-lottie-player>` for interactive **dotLottie** files:
 * `theme` (a theme id from the file's `t/` folder; slots are resolved by
 * `motionary/runtime/lottie-state`) and `state-machine` (a state machine
 * id from `s/`, subset: playback states, Event / Numeric / String /
 * Boolean guards, pointer + completion interactions, input / theme / frame
 * actions; OpenUrl is ignored). Requires `use(vector, lottieState)`.
 * Same attributes as `<usa-lottie-player>`; API adds `stateMachine`,
 * `state`, `fire(name)`, `setInput(name, value)`, `setTheme(id)`; events
 * `usa:state` { state, from }, `usa:custom` { name }. Reduced motion: the
 * first frame of each state is shown instead of playing. Its own entry
 * point: `motionary/components/dotlottie`.
 */
interface UsaDotLottieElement extends UsaLottiePlayerElement {
    readonly stateMachine: StateMachine | null;
    readonly state: string | null;
    fire(name: string): void;
    setInput(name: string, value: unknown): void;
    setTheme(id: string | null): void;
}
declare function defineDotLottie(tag?: string): CustomElementConstructor | undefined;
declare global {
    interface HTMLElementTagNameMap {
        'usa-dotlottie': UsaDotLottieElement;
    }
}

export { defineDotLottie };
export type { UsaDotLottieElement };
