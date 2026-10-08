type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
type Cleanup = () => void;
/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
}

/**
 * `<usa-fx effect="pop" trigger="click">` — plays any registered effect
 * (`registerEffect()`) on its first element child (or itself with `self`).
 * `trigger`: `click` (default) · `hover` · `enter` · `load` · `loop` · `manual`;
 * `options` (JSON) is passed to the effect; `once`. Method `play()`.
 */
interface UsaFxElement extends UsaElement {
    readonly target: HTMLElement;
    play(): Promise<void>;
}
declare function defineFx(tag?: string): CustomElementConstructor | undefined;

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
declare const EFFECT_TRIGGERS: readonly ["click", "hover", "enter", "load", "loop", "manual"];
type EffectTrigger = (typeof EFFECT_TRIGGERS)[number];
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
/** Register an effect (throws on a duplicate name unless `override`). Returns an unregister function. */
declare function registerEffect<O extends Record<string, unknown>>(def: EffectDefinition<O>, opts?: {
    override?: boolean;
}): () => void;
/** Register several effects at once (already-registered names are skipped). */
declare function registerEffects(defs: EffectDefinition<any>[]): void;
declare const getEffect: (name: string) => EffectDefinition | undefined;
declare const hasEffect: (name: string) => boolean;
/** Registered effects (optionally of one kind), sorted by name. */
declare function listEffects(kind?: EffectKind): EffectDefinition[];
/**
 * Play a registered effect once on `el`. Resolves when it finishes (or
 * immediately for fire-and-forget effects). Unknown names reject.
 */
declare function playEffect(el: HTMLElement, name: string, options?: Record<string, unknown>, event?: Event): Promise<void>;
/**
 * Bind an effect to a trigger on `el`: `click`, `hover` (pointerenter / focus),
 * `enter` (scrolls into view; `once` by default), `load` (now), `loop`
 * (starts now, cleanup stops it) or `manual` (nothing). Returns an unbind.
 */
declare function bindEffect(el: HTMLElement, name: string, options?: Record<string, unknown> & {
    trigger?: EffectTrigger;
    once?: boolean;
}): Cleanup;

/** Every built-in 5.0 effect definition. */
declare const BUILTIN_EFFECTS: EffectDefinition[];

/**
 * use-scroll-animate/components/fx — unified plugin-style effects (5.0).
 * `registerEffect({ name, kind, run })`, `playEffect(el, name)`,
 * `bindEffect(el, name, { trigger })`, `<usa-fx effect trigger>`. Built-ins:
 * every timeline preset (`enter`), `pulse` · `pop` · `jelly` · `wiggle` ·
 * `heartbeat` · `bounce` · `flash` · `tada` · `shake` (attention),
 * `burst` · `confetti` · `ripple` (click). More packs: `use-scroll-animate/components/effects`.
 */

/** Register the built-in effects (idempotent; `defineFxComponents()` calls it). */
declare function registerBuiltinEffects(): void;
/** Register every component of this category under its default tag (+ the built-in effects). */
declare function defineFxComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-fx': UsaFxElement;
    }
}

export { BUILTIN_EFFECTS, EFFECT_KINDS, EFFECT_TRIGGERS, bindEffect, defineFx, defineFxComponents, getEffect, hasEffect, listEffects, playEffect, registerBuiltinEffects, registerEffect, registerEffects };
export type { EffectContext, EffectDefinition, EffectKind, EffectTrigger, UsaFxElement };
