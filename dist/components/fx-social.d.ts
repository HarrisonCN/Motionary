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
 * 7.4 — Chat & social motion (`motionary/fx/social`, also
 * `motionary/components/fx-social`):
 *
 * - `typing-dots` (loop) — three dots bounce in a wave inside the element.
 * - `message-in` (enter) — a chat bubble pops in from its side (`side`
 *   "left" | "right", or `data-side`), with a little overshoot.
 * - `reaction-burst` (click) — the element's emoji (`emoji`) floats up in a
 *   small fan and fades.
 * - `read-receipt` (enter) — ✓✓ ticks draw in and turn blue (`color`).
 * - `mention-glow` (attention) — a soft highlight sweeps behind an @mention.
 *
 * Reduced motion: typing-dots shows static dots, message-in / read-receipt
 * fade, reaction-burst does nothing, mention-glow sets a static highlight.
 */

/** Fan-out angles (deg) for `n` floating emoji, centred on straight up (7.4). */
declare function fanAngles(n: number, spread?: number): number[];
declare const SOCIAL_FX: EffectDefinition[];
/** Register the 7.4 chat & social pack (idempotent). */
declare function registerSocialPack(): void;

export { SOCIAL_FX, fanAngles, registerSocialPack };
