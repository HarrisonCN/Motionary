type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
type Cleanup = () => void;

/**
 * 5.0 — unified plugin-style effect registration. Every effect (built-in or
 * yours) is a plain object registered once and played the same way:
 * `playEffect(el, name)`, `bindEffect(el, name, { trigger })` or
 * `<usa-fx effect="name" trigger="click">`. Effects get a context that
 * already applies reduced motion, motion sensitivity, intensity and the
 * animation budget.
 */

declare const EFFECT_KINDS: readonly ["enter", "exit", "attention", "click", "hover", "card", "loop", "page", "background", "text", "cursor", "scroll"];
type EffectKind = (typeof EFFECT_KINDS)[number];
interface EffectContext {
    /** Reduced motion applies (OS setting, `minimal` / `static` sensitivity). */
    readonly reduced: boolean;
    readonly sensitivity: MotionSensitivity;
    /** The triggering event (pointer position for click effects), if any. */
    readonly event?: Event;
    /** `el.animate()` with the library's motion rules (may return `null`). */
    animate(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation | null;
    /** Register teardown for long-running effects (loops, listeners). */
    onCleanup(fn: Cleanup): void;
}
interface EffectDefinition<O extends Record<string, unknown> = Record<string, any>> {
    /** Unique, kebab-case. */
    name: string;
    kind: EffectKind;
    /** One line for docs and the gallery. */
    description?: string;
    /** Option defaults (merged under the caller's options). */
    defaults?: Partial<O>;
    /**
     * Under reduced motion: `'skip'` (do nothing — default for loop, background
     * and cursor effects) or `'run'` (run with `ctx.reduced === true`, the
     * effect degrades itself — default for everything else).
     */
    reduced?: 'skip' | 'run';
    /** Play the effect. Return an Animation / Promise to be awaited, or a cleanup. */
    run(el: HTMLElement, options: O, ctx: EffectContext): void | Cleanup | Animation | null | Promise<unknown>;
}

/**
 * 9.2 — Lottie import (`motionary/fx/lottie`, also `motionary/components/fx-lottie`).
 *
 * `lottieToKeyframes(json)` converts the layer transforms of a Lottie
 * (bodymovin) JSON — position `p`, scale `s`, rotation `r`, opacity `o`
 * (static or keyframed) — into WAAPI keyframes per layer plus the duration
 * (`op − ip` frames at `fr` fps), so a designer's After Effects motion runs
 * on Motionary's clock without lottie-web. `lottieToSvg(json)` renders the
 * simple vector shapes (ellipse `el`, rect `rc`, path `sh`, fill `fl`,
 * stroke `st`) as SVG groups, one per layer. `riveInputs(instance, el, map)`
 * wires Motionary-style triggers (hover / press / click / enter) to the
 * boolean / trigger inputs of a Rive state machine you created with the
 * Rive runtime.
 *
 * Effects: `lottie-play` (attention) plays the keyframes stored on an
 * element by `<usa-lottie>`; `icon-pop` (click) a sticker-like pop with a
 * ring burst for icons. Reduced motion: no motion.
 */

interface LottieLayerMotion {
    name: string;
    index: number;
    keyframes: Keyframe[];
    anchor: [number, number];
}
interface LottieMotion {
    width: number;
    height: number;
    duration: number;
    layers: LottieLayerMotion[];
}
/** Lottie JSON → WAAPI keyframes per layer + duration (ms) (9.2). */
declare function lottieToKeyframes(json: any): LottieMotion;
/** Render the simple vector layers of a Lottie JSON as an SVG string (one `<g data-layer>` per layer, top layer last) (9.2). */
declare function lottieToSvg(json: any): string;
/** Wire hover / press / click / enter on `el` to a Rive state machine's inputs: map { hover: 'isHover', click: 'fire' } (9.2). */
declare function riveInputs(instance: {
    stateMachineInputs(sm: string): any[];
}, stateMachine: string, el: HTMLElement, map: Partial<Record<'hover' | 'press' | 'click' | 'enter', string>>): () => void;
declare const LOTTIE_FX: EffectDefinition[];
/** Register lottie-play and icon-pop (9.2). */
declare function registerLottiePack(): void;

export { LOTTIE_FX, lottieToKeyframes, lottieToSvg, registerLottiePack, riveInputs };
export type { LottieLayerMotion, LottieMotion };
