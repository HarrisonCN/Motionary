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
 * 8.2 — Retro pack (`motionary/fx/retro`, also `motionary/components/fx-retro`):
 *
 * - `pixelate-in` (enter) — the element resolves from big blocky pixels to
 *   sharp, like an 8-bit sprite loading (`steps`).
 * - `crt-power` (enter) — a CRT switching on: a bright line opens into the
 *   picture with a flash (`duration`).
 * - `vhs-glitch` (attention) — VHS tracking jitter with an RGB split and a
 *   noise band (`intensity`).
 * - `y2k-shine` (attention) — a chrome Y2K highlight sweeps across the
 *   element with a little bounce (`color`).
 *
 * Reduced motion: pixelate-in / crt-power fade in, vhs-glitch does nothing,
 * y2k-shine is a short brightness flash.
 */

/** Keyframes stepping a CSS blur/contrast "pixel" filter from coarse to sharp (8.2). */
declare function pixelSteps(steps?: number): Keyframe[];
declare const RETRO_FX: EffectDefinition[];
/** Register pixelate-in, crt-power, vhs-glitch and y2k-shine (8.2). */
declare function registerRetroPack(): void;

export { RETRO_FX, pixelSteps, registerRetroPack };
