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
 * 5.5 — generative backgrounds on Canvas 2D, registered through
 * `registerEffect()` (kind `background`): `flow-field`, `voronoi`,
 * `mesh-gradient`, `starfield`, `metaballs`, `contours`.
 *
 * Shared runner (`canvasBackground()`): a canvas behind the element's content
 * (`aria-hidden`, pointer-transparent), rendering only while visible
 * (IntersectionObserver) and the tab is shown, with adaptive quality — the
 * render scale drops when frames get slow and recovers when they are fast.
 * Reduced motion: one static frame, no loop.
 */

interface GenFrame {
    ctx: CanvasRenderingContext2D;
    /** CSS-pixel size of the canvas. */
    w: number;
    h: number;
    /** Seconds since start (0 for the static reduced-motion frame). */
    t: number;
    /** Render scale 0.35–1 (adaptive quality). */
    quality: number;
    /** Per-effect state, created by `init`. */
    state: any;
    /** Merged options. */
    o: any;
}
interface GenerativeSpec {
    init?: (w: number, h: number, o: any) => any;
    draw: (f: GenFrame) => void;
}
/** Deterministic smooth pseudo-noise in [-1, 1] (sum of sines — cheap, no tables). */
declare function noise2(x: number, y: number, t?: number): number;
/** Hex `#rrggbb` → [r, g, b]. */
declare function hexRgb(hex: string): [number, number, number];
/**
 * Mount a generative canvas behind `el` and run `spec` on it. Returns the
 * cleanup. Exposed for custom generative effects.
 */
declare function canvasBackground(el: HTMLElement, fx: EffectContext, spec: GenerativeSpec, o: any): () => void;
declare const GENERATIVE_FX: EffectDefinition[];

/**
 * 5.6 — sound-reactive effects (Web Audio).
 *
 * - `enableAudio(input)` — start analysing the microphone (`'mic'`), an
 *   `<audio>` / `<video>` element (or a selector for one) or a `MediaStream`.
 *   Browsers only allow an `AudioContext` to start inside a user gesture, so
 *   call it from a click handler (or use `<usa-audio>`, which renders the
 *   toggle button for you).
 * - Background effects (kind `background`, Canvas 2D through
 *   `canvasBackground()`): `spectrum-bars`, `pulse-ring`, `wave-ring`. Before
 *   audio is enabled they idle gently.
 * - Beat detection: `createBeatDetector()` (pure: energy → beat?), `onBeat(cb)`
 *   and `bindBeat(el, effect, options)`, which plays any registered effect on
 *   every beat. `<usa-audio>` does the same for `[data-usa-beat="effect"]`
 *   children and emits `usa-beat`.
 * - While audio runs, `--usa-audio-level` and `--usa-audio-bass` (0–1) are set
 *   on `<html>` for CSS-driven reactions.
 *
 * Reduced motion: the visual effects are skipped, beats play no effects and
 * the CSS variables stay at 0 — audio itself keeps playing.
 */

type AudioInput = 'mic' | HTMLMediaElement | MediaStream | string;
interface AudioSample {
    /** Overall loudness (RMS of the waveform), 0–1. */
    level: number;
    /** Low-frequency energy (first ~8 % of the spectrum), 0–1. */
    bass: number;
    /** Frequency bins, 0–255 each. */
    freq: Uint8Array;
    /** Time-domain waveform, 0–255 (128 = silence). */
    wave: Uint8Array;
}
interface AudioReactive {
    readonly context: AudioContext;
    readonly analyser: AnalyserNode;
    /** Read the analyser now. */
    sample(): AudioSample;
    /** Stop analysing (media keeps playing; the microphone is released). */
    stop(): void;
}
interface BeatOptions {
    /** A beat is energy above `threshold` × the recent average (default 1.35). */
    threshold?: number;
    /** Minimum ms between beats (default 250). */
    cooldown?: number;
    /** Frames of history for the average (default 43 ≈ 0.7 s). */
    history?: number;
    /** Ignore energy below this floor, 0–1 (default 0.08). */
    floor?: number;
}
/** The running analyser, if `enableAudio()` was called. */
declare const getAudio: () => AudioReactive | null;
/**
 * Start analysing `input` and make it the source of every sound-reactive
 * effect. Call from a user gesture. Replaces a previous source.
 */
declare function enableAudio(input?: AudioInput, opts?: {
    fftSize?: number;
    smoothing?: number;
}): Promise<AudioReactive>;
/** Stop the current audio source (if any). */
declare function disableAudio(): void;
/** A pure beat detector: feed it energy (0–1) and a timestamp per frame; it answers "beat?". */
declare function createBeatDetector(o?: BeatOptions): (energy: number, now: number) => boolean;
/** Call `cb` on every detected beat of the current audio source. Returns an unsubscribe. */
declare function onBeat(cb: (detail: {
    energy: number;
    time: number;
}) => void, o?: BeatOptions): () => void;
/** Play the registered effect `name` on `el` at every beat (not under reduced motion). Returns an unbind. */
declare function bindBeat(el: HTMLElement, name: string, options?: Record<string, unknown> & BeatOptions): () => void;
declare const AUDIO_FX: EffectDefinition[];
interface UsaAudioElement extends UsaElement {
    /** `true` while this element's audio source is being analysed. */
    readonly active: boolean;
    /** Start (from a user gesture) or stop analysing. */
    toggle(): Promise<void>;
}
/**
 * `<usa-audio source="#track | mic" label="…">` — a toggle button (yours, as
 * `[data-audio-toggle]`, or one it renders) that enables the audio source on
 * click; children with `data-usa-beat="effect"` play that effect on every
 * beat (`data-usa-beat-options` JSON; `threshold` / `cooldown` attributes).
 * Emits `usa-beat` and `usa-audio-error`.
 */
declare function defineAudio(tag?: string): CustomElementConstructor | undefined;

/**
 * 5.7 — cursor & gesture packs.
 *
 * Cursor effects (kind `cursor`, persistent, scoped to the element they are
 * bound to; skipped under reduced motion and — unless `touch: true` — for
 * touch pointers): `comet-trail`, `sparkle-trail`, `ribbon-trail`,
 * `magnetic-dots`, `spotlight-cursor`.
 *
 * Gestures → effects: `bindGesture(el, 'fling' | 'twist' | 'long-press',
 * effectOrCallback, options)` and `<usa-gesture-fx gesture effect>`. A fling
 * is a fast release, a twist a two-finger rotation past `angle` degrees, a
 * long press "charges" `--usa-charge` 0 → 1 and fires when full. Every fire
 * dispatches `usa-gesture` (`detail: { gesture, … }`). The effect itself goes
 * through `playEffect()`, so reduced motion is honoured there.
 */

type Pt = {
    x: number;
    y: number;
    t: number;
};
declare const CURSOR_FX: EffectDefinition[];
declare const GESTURES: readonly ["fling", "twist", "long-press"];
type GestureName = (typeof GESTURES)[number];
interface GestureFxOptions {
    /** fling: minimum release speed in px/ms (default 0.8). */
    velocity?: number;
    /** twist: degrees of rotation that fire (default 30). */
    angle?: number;
    /** long-press: ms to fully charge (default 650). */
    duration?: number;
    /** long-press: px the pointer may move before the press is cancelled (default 10). */
    tolerance?: number;
    /** Options passed to the effect. */
    effectOptions?: Record<string, unknown>;
}
interface GestureDetail {
    gesture: GestureName;
    /** fling */
    vx?: number;
    vy?: number;
    speed?: number;
    direction?: 'left' | 'right' | 'up' | 'down' | 'cw' | 'ccw';
    /** twist: signed degrees since the last fire. */
    angle?: number;
    /** long-press: 1 when fired. */
    charge?: number;
}
/** Release velocity (px/ms) from recent pointer samples: uses the last `window` ms (pure). */
declare function flingVelocity(pts: Pt[], window?: number): {
    vx: number;
    vy: number;
    speed: number;
};
/** Signed smallest difference between two angles in degrees, in (-180, 180] (pure). */
declare function angleDelta(a: number, b: number): number;
/**
 * Fire `effect` (a registered effect name, or a callback) when `gesture`
 * happens on `el`. Returns an unbind.
 */
declare function bindGesture(el: HTMLElement, gesture: GestureName, effect: string | ((d: GestureDetail, e: Event) => void), o?: GestureFxOptions): () => void;
interface UsaGestureFxElement extends UsaElement {
    readonly gesture: GestureName;
}
/**
 * `<usa-gesture-fx gesture="fling | twist | long-press" effect="tada"
 * options='{"…"}' velocity angle duration>` — plays `effect` on its first
 * child (or itself with `self`) when the gesture happens.
 */
declare function defineGestureFx(tag?: string): CustomElementConstructor | undefined;

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
/** 5.5: generative Canvas 2D backgrounds. */
declare function registerGenerativeEffects(): void;
/** 5.6: sound-reactive (Web Audio) backgrounds. */
declare function registerAudioEffects(): void;
/** 5.7: cursor trails, magnetic dots, spotlight cursor. */
declare function registerCursorEffects(): void;
/** Define the 5.x elements of this entry (`<usa-story>`, …) under their default tags. */
declare function defineEffectElements(): void;
/** Register the built-ins and every pack (idempotent). */
declare function registerAllEffects(): void;

export { AUDIO_FX, CARD_FX, CLICK_FX, CURSOR_FX, EFFECT_PACKS, GENERATIVE_FX, GESTURES, PAGE_FX, PHYSICS_FX, STORY_TEMPLATES, angleDelta, bindBeat, bindGesture, bounceKeyframes, canvasBackground, createBeatDetector, defineAudio, defineEffectElements, defineGestureFx, defineStory, disableAudio, enableAudio, flingVelocity, formatCount, fxLayer, getAudio, hexRgb, noise2, onBeat, registerAllEffects, registerAudioEffects, registerCardClickEffects, registerCursorEffects, registerGenerativeEffects, registerPageEffects, registerPhysicsEffects, solveSpring, springKeyframes, storyProgress };
export type { AudioInput, AudioReactive, AudioSample, BeatOptions, GenFrame, GenerativeSpec, GestureDetail, GestureFxOptions, GestureName, SpringOptions, StoryTemplate, UsaAudioElement, UsaGestureFxElement, UsaStoryElement };
