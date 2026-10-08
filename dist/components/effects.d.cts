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

/**
 * 5.4 — `<usa-story template="…">` scroll-storytelling templates.
 *
 * - `pin` — a sticky `[data-stage]` while `[data-step]` sections scroll past; the
 *   step in view gets `data-active`, the stage gets `data-active-step="<index>"`.
 * - `gallery` — a horizontal `[data-track]` slides sideways as you scroll down.
 * - `zoom` — the `[data-stage]` zooms toward the viewer (`zoom="6"`) and fades.
 * - `compare` — before / after (`[data-before]`, `[data-after]`) wipe driven by
 *   scroll, plus a draggable, keyboard-accessible handle (`role="slider"`).
 * - `counter` — `[data-count="1234"]` numbers count up when they enter view.
 * - `highlight` — paragraphs dim except the one crossing the viewport center.
 *
 * Every template sets `--usa-story-progress` (0–1) on the host and dispatches
 * `usa-story-step` (`detail: { index }`). Reduced motion: no sliding / zooming
 * (the gallery stacks vertically), counters show final values, the rest is
 * class changes only.
 */

declare const STORY_TEMPLATES: readonly ["pin", "gallery", "zoom", "compare", "counter", "highlight"];
type StoryTemplate = (typeof STORY_TEMPLATES)[number];
interface UsaStoryElement extends UsaElement {
    /** Scroll progress through the story, 0–1. */
    readonly progress: number;
    /** Index of the active step (pin / highlight), or -1. */
    readonly step: number;
}
/** Progress of `el` through the viewport: 0 when its top hits the viewport top, 1 when its bottom hits the viewport bottom. */
declare function storyProgress(el: Element, vh?: number): number;
/** Format a counted value like the target (`1,234`, `12.5`, prefix / suffix kept). */
declare function formatCount(target: string, t: number): string;
declare function defineStory(tag?: string): CustomElementConstructor | undefined;
declare global {
    interface HTMLElementTagNameMap {
        'usa-story': UsaStoryElement;
    }
}

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
/** Define the 5.x elements of this entry (`<usa-story>`, …) under their default tags. */
declare function defineEffectElements(): void;
/** Register the built-ins and every pack (idempotent). */
declare function registerAllEffects(): void;

export { CARD_FX, CLICK_FX, EFFECT_PACKS, PAGE_FX, PHYSICS_FX, STORY_TEMPLATES, bounceKeyframes, defineEffectElements, defineStory, formatCount, fxLayer, registerAllEffects, registerCardClickEffects, registerPageEffects, registerPhysicsEffects, solveSpring, springKeyframes, storyProgress };
export type { SpringOptions, StoryTemplate, UsaStoryElement };
