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
 * `motionary/plugins` (10.0) — every built-in effect pack as a plugin for
 * `createMotion().use(…)` (`motionary/core`) or `usePlugins(…)` (`motionary/fx2`).
 * Import only the ones you use; each pulls in just its own pack.
 */

interface EffectPlugin {
    name: string;
    effects: EffectDefinition[];
}
/** The `gpu` pack. */
declare const gpu: EffectPlugin;
/** The `text` pack. */
declare const text: EffectPlugin;
/** The `light` pack. */
declare const light: EffectPlugin;
/** The `depth` pack. */
declare const depth: EffectPlugin;
/** The `morph` pack. */
declare const morph: EffectPlugin;
/** The `transitions` pack. */
declare const transitions: EffectPlugin;
/** The `weather` pack. */
declare const weather: EffectPlugin;
/** The `physics` pack. */
declare const physics: EffectPlugin;
/** The `focus` pack. */
declare const focus: EffectPlugin;
/** The `music` pack. */
declare const music: EffectPlugin;
/** The `chart` pack. */
declare const chart: EffectPlugin;
/** The `shop` pack. */
declare const shop: EffectPlugin;
/** The `social` pack. */
declare const social: EffectPlugin;
/** The `game` pack. */
declare const game: EffectPlugin;
/** The `geo` pack. */
declare const geo: EffectPlugin;
/** The `form` pack. */
declare const form: EffectPlugin;
/** The `ai` pack. */
declare const ai: EffectPlugin;
/** The `festival` pack. */
declare const festival: EffectPlugin;
/** The `retro` pack. */
declare const retro: EffectPlugin;
/** The `organic` pack. */
declare const organic: EffectPlugin;
/** The `cyber` pack. */
declare const cyber: EffectPlugin;
/** The `paper` pack. */
declare const paper: EffectPlugin;
/** The `surface` pack. */
declare const surface: EffectPlugin;
/** The `gesture3` pack. */
declare const gesture3: EffectPlugin;
/** The `spatial` pack. */
declare const spatial: EffectPlugin;
/** The `cinema` pack. */
declare const cinema: EffectPlugin;
/** The `lottie` pack. */
declare const lottie: EffectPlugin;
/** The `genart` pack. */
declare const genart: EffectPlugin;
/** The `video` pack. */
declare const video: EffectPlugin;
/** The `safe` pack. */
declare const safe: EffectPlugin;
/** The `perf3` pack. */
declare const perf3: EffectPlugin;
/** Every built-in plugin. */
declare const ALL_PLUGINS: EffectPlugin[];

export { ALL_PLUGINS, ai, chart, cinema, cyber, depth, festival, focus, form, game, genart, geo, gesture3, gpu, light, lottie, morph, music, organic, paper, perf3, physics, retro, safe, shop, social, spatial, surface, text, transitions, video, weather };
export type { EffectPlugin };
