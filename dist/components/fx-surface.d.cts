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
 * 8.6 — Surface theme pack (`motionary/fx/surface`, also `motionary/components/fx-surface`):
 *
 * - `neon-ignite` (enter) — the element powers on like a neon tube: a few
 *   stuttering flickers, then a steady glow (`color`).
 * - `neon-pulse` (loop) — a slow breathing neon glow; the cleanup stops it
 *   (`color`).
 * - `glass-frost` (enter) — frosted glass condenses: blur and transparency
 *   settle into a crisp glass panel, with a shine passing over it.
 * - `neu-press` (attention) — a soft neumorphic press: the raised shadow
 *   flips to an inset one and pops back.
 *
 * Reduced motion: neon-ignite / glass-frost just show, neon-pulse is
 * skipped, neu-press does nothing.
 */

/** The built-in surface themes of the 8.6 theme system. */
declare const SURFACE_THEMES: readonly ["light", "dark", "neon", "glass", "neu"];
type SurfaceTheme = (typeof SURFACE_THEMES)[number];
/** Set `data-usa-surface` on `target` (default `<html>`) and return the theme actually applied (unknown → `light`) (8.6). */
declare function applySurfaceTheme(name: string, target?: Element | null): SurfaceTheme;
declare const SURFACE_FX: EffectDefinition[];
/** Register neon-ignite, neon-pulse, glass-frost and neu-press (8.6). */
declare function registerSurfacePack(): void;

export { SURFACE_FX, SURFACE_THEMES, applySurfaceTheme, registerSurfacePack };
export type { SurfaceTheme };
