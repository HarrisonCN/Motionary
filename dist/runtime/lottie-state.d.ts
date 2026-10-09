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
interface ThemeRule {
    id: string;
    type: string;
    value?: Any;
    keyframes?: {
        frame: Num;
        value: Any;
        inTangent?: Any;
        outTangent?: Any;
        hold?: boolean;
    }[];
    animations?: string[];
    expression?: string;
}
interface LottieTheme {
    rules: ThemeRule[];
}
/** A theme rule as a Lottie property ({ a, k }). */
declare function ruleProp(r: ThemeRule): Any;
/**
 * A copy of `animation` with its slots resolved: every property that names a
 * slot (`"sid"`) takes the theme's rule for it, else the animation's default
 * slot value. `animationId` limits rules that list `animations`.
 */
declare function applyTheme(animation: Any, theme?: LottieTheme | null, animationId?: string): Any;
interface SmInput {
    type: 'Numeric' | 'String' | 'Boolean' | 'Event';
    name: string;
    value?: Any;
}
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
interface SmInteraction {
    type: string;
    layerName?: string;
    stateName?: string;
    actions: SmAction[];
}
interface StateMachineDef {
    initial: string;
    states: SmState[];
    transitions?: SmTransition[];
    inputs?: SmInput[];
    interactions?: SmInteraction[];
}
interface StateMachineHooks {
    onState?(state: SmState, from: SmState | null): void;
    onTheme?(id: string): void;
    onFrame?(frame: Num): void;
    onProgress?(progress: Num): void;
    onCustomEvent?(name: string): void;
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
/** What a state machine uses that this subset skips (never throws). */
declare function inspectStateMachine(def: StateMachineDef): string[];
declare function compare(v: Any, op: string | undefined, to: Any): boolean;
/** Run a dotLottie state machine (subset). `hooks.onState` applies each state to a player. */
declare function createStateMachine(def: StateMachineDef, hooks?: StateMachineHooks): StateMachine;
interface LottieStateApi {
    applyTheme: typeof applyTheme;
    ruleProp: typeof ruleProp;
    createStateMachine: typeof createStateMachine;
    inspectStateMachine: typeof inspectStateMachine;
    compare: typeof compare;
}
declare const lottieState: RuntimeModule<LottieStateApi>;

export { applyTheme, compare, createStateMachine, inspectStateMachine, lottieState, ruleProp };
export type { LottieStateApi, LottieTheme, SmAction, SmGuard, SmInput, SmInteraction, SmState, SmTransition, StateMachine, StateMachineDef, StateMachineHooks, ThemeRule };
