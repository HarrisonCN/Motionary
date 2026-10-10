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
 * 7.5 — Gamification motion (`motionary/fx/game`, also
 * `motionary/components/fx-game`):
 *
 * - `achievement-unlock` (attention) — the element slides in, a light sweep
 *   crosses it and its icon (`[data-icon]` or first child) pops.
 * - `level-up` (attention) — a scale-up with a ring shockwave.
 * - `chest-open` (click) — the lid (`[data-lid]` or first child) flips open
 *   and sparks fly out.
 * - `coin-burst` (click) — coins (`coin`, default 🪙) arc up and fall.
 * - `xp-gain` (enter) — a “+50 XP” label (`text` or `data-xp`) floats up and
 *   fades.
 *
 * Reduced motion: unlock / level-up fade, chest-open sets the lid open,
 * coin-burst and xp-gain do nothing.
 */

/** Ballistic keyframe points for a coin thrown at `deg` with `power` (7.5). */
declare function throwPath(deg: number, power?: number, steps?: number, g?: number): {
    x: number;
    y: number;
}[];
declare const GAME_FX: EffectDefinition[];
/** Register the 7.5 gamification pack (idempotent). */
declare function registerGamePack(): void;

export { GAME_FX, registerGamePack, throwPath };
