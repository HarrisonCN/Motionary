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
 * 7.7 — Form motion (`motionary/fx/form`, also `motionary/components/fx-form`):
 *
 * - `field-shake` (attention) — the element shakes sideways with a red
 *   outline flash, the classic "invalid" cue (`distance`, `color`).
 * - `field-success` (attention) — a green glow pulses round the element and a
 *   small check badge pops on its corner (`color`).
 * - `label-float` (enter) — every `label` (or `[data-label]`) inside rises and
 *   settles, one after another, like floating labels (`stagger`).
 * - `form-cascade` (enter) — the element's children (fields, buttons) slide
 *   in one after another (`stagger`, `distance`).
 *
 * Reduced motion: field-shake / field-success only flash the outline colour,
 * label-float and form-cascade fade in.
 */

/** Decaying sideways shake keyframes (7.7). */
declare function shakeFrames(distance?: number, steps?: number): Keyframe[];
declare const FORM_FX: EffectDefinition[];
/** Register field-shake, field-success, label-float and form-cascade (7.7). */
declare function registerFormPack(): void;

export { FORM_FX, registerFormPack, shakeFrames };
