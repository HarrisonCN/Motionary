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
 * 5.1 — card & click effects 2.0, registered through `registerEffect()`.
 * Card: `holo` (holographic foil following the pointer), `glare-sweep`,
 * `book-open`, `card-fan`, `topple`, `float-tilt`. Click: `shockwave`,
 * `ink-splash`, `star-burst`, `jelly-press`, `ring-ripple`, `emoji-rain`.
 */

declare const CARD_FX: EffectDefinition[];
declare const CLICK_FX: EffectDefinition[];

/**
 * 5.2 — bounce & physics micro-interactions, registered through
 * `registerEffect()`. Keyframes come from a damped-spring / gravity solver
 * (`springKeyframes()`, `bounceKeyframes()`), so the motion is physical but
 * still runs on the Web Animations API (compositor, reduced-motion aware).
 * Effects: `bounce-in`, `rubber-band`, `elastic-hover`, `drop-bounce`,
 * `gravity-text`, `spring-follow`, `bell-swing`.
 */

interface SpringOptions {
    stiffness?: number;
    damping?: number;
    mass?: number;
    /** Samples (keyframes). */
    steps?: number;
}
/**
 * Sample a damped spring from 0 → 1 and return the progress values plus the
 * time (ms) it takes to settle. Pure, deterministic.
 */
declare function solveSpring({ stiffness, damping, mass, steps }?: SpringOptions): {
    values: number[];
    duration: number;
};
/** Keyframes for a property driven by a spring: `map(progress)` → keyframe. */
declare function springKeyframes(map: (p: number) => Keyframe, spring?: SpringOptions): {
    frames: Keyframe[];
    duration: number;
};
/** Height (0 = floor, 1 = drop height) of a ball dropped with restitution `bounce`, sampled `steps` times. */
declare function bounceKeyframes(bounce?: number, steps?: number): number[];
declare const PHYSICS_FX: EffectDefinition[];

/**
 * 5.3 — page-wide effects, registered through `registerEffect()`.
 * Transitions (cover → `onCovered()` → reveal): `curtain`, `iris`,
 * `pixel-dissolve`, `blinds`. Persistent page effects: `velocity-skew`,
 * `spotlight`, `edge-glow`.
 *
 * ```ts
 * await playEffect(document.body, 'iris', { onCovered: () => router.go('/next') });
 * ```
 */

declare const PAGE_FX: EffectDefinition[];

/** Helpers shared by the 5.x effect packs. */

/** A fixed, pointer-transparent, aria-hidden layer for transient particles. */
declare function fxLayer(): HTMLElement;

/** The effect packs by version, in release order. */
declare const EFFECT_PACKS: Record<string, EffectDefinition[]>;
/** 5.1: card & click effects 2.0. */
declare function registerCardClickEffects(): void;
/** 5.2: bounce & physics micro-interactions. */
declare function registerPhysicsEffects(): void;
/** 5.3: page-wide transitions and effects. */
declare function registerPageEffects(): void;
/** Register the built-ins and every pack (idempotent). */
declare function registerAllEffects(): void;

export { CARD_FX, CLICK_FX, EFFECT_PACKS, PAGE_FX, PHYSICS_FX, bounceKeyframes, fxLayer, registerAllEffects, registerCardClickEffects, registerPageEffects, registerPhysicsEffects, solveSpring, springKeyframes };
export type { SpringOptions };
