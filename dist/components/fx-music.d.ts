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
 *   children and emits `usa:beat`.
 * - While audio runs, `--usa-audio-level` and `--usa-audio-bass` (0–1) are set
 *   on `<html>` for CSS-driven reactions.
 *
 * Reduced motion: the visual effects are skipped, beats play no effects and
 * the CSS variables stay at 0 — audio itself keeps playing.
 */

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

/**
 * 7.1 — Music visualization (`motionary/fx/music`, also
 * `motionary/components/fx-music`), registered through `registerEffect()`.
 * Every effect reads the running analyser (`enableAudio()` / `<usa-audio>`);
 * without one it plays a gentle synthetic signal (`syntheticSample()`), so
 * the visuals work as decoration too.
 *
 * - `waveform-scope` (background) — an oscilloscope line of the waveform.
 * - `radial-spectrum` (background) — spectrum bars around a circle.
 * - `spectrum-mirror` (background) — mirrored bars with a reflection.
 * - `sound-particles` (background) — particles launched by the bass.
 * - `beat-bounce` (loop) — the element pumps with the bass.
 * - `vinyl-spin` (loop) — the element turns like a record; level speeds it.
 *
 * Reduced motion: backgrounds draw one static frame, loops do nothing.
 */

/** A smooth, deterministic fake analyser frame at time `t` (s). */
declare function syntheticSample(t: number, bins?: number): AudioSample;
/** The live analyser frame, or the synthetic one. */
declare const musicSample: (t: number) => AudioSample;
declare const MUSIC_FX: EffectDefinition[];
/** Register the 7.1 music visualization pack (idempotent). */
declare function registerMusicPack(): void;

export { MUSIC_FX, musicSample, registerMusicPack, syntheticSample };
