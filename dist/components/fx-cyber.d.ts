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
 * 8.4 — Cyber / sci-fi pack (`motionary/fx/cyber`, also `motionary/components/fx-cyber`):
 *
 * - `hud-frame` (enter) — corner brackets draw in around the element and a
 *   scan bar sweeps across it, like a HUD locking on (`color`).
 * - `scanline-sweep` (attention) — a bright horizontal scanline runs down
 *   the element (`color`, `passes`).
 * - `hologram` (loop) — a flickering, translucent cyan hologram look with
 *   drifting scan bands; the cleanup restores the element (`color`).
 * - `data-decode` (enter) — the text resolves from random glyphs to the real
 *   characters, left to right (`speed`).
 *
 * Reduced motion: hud-frame / data-decode just show, scanline-sweep does
 * nothing, hologram is skipped. Overlays are `aria-hidden` and removed.
 */

/** The `k`-th frame of decoding `text` over `n` frames: resolved prefix + random glyphs (8.4). */
declare function decodeFrame(text: string, k: number, n: number, rnd?: () => number): string;
declare const CYBER_FX: EffectDefinition[];
/** Register hud-frame, scanline-sweep, hologram and data-decode (8.4). */
declare function registerCyberPack(): void;

export { CYBER_FX, decodeFrame, registerCyberPack };
