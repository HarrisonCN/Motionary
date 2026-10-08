/**
 * motionary/components — shared base for the `<usa-*>` custom elements.
 *
 * Everything here is lazy: nothing touches `window`, `document`,
 * `HTMLElement` or `matchMedia` at import time, so the components can be
 * imported during SSR (Next, Nuxt, Astro…) and in Electron/Tauri preload
 * scripts. Classes are created the first time a `define*()` function runs.
 */
interface ComponentsConfig {
    /**
     * Inject each component's CSS when it is defined (default `true`). Uses a
     * constructable stylesheet (`document.adoptedStyleSheets`, which a strict
     * `style-src` CSP does not block) and falls back to a `<style>` tag. Set
     * to `false` when you load `motionary/components.css` yourself.
     */
    injectStyles?: boolean;
    /**
     * `'user'` (default) follows `prefers-reduced-motion`; `'reduce'` always
     * uses the reduced variants (e.g. a kiosk / battery-saver mode). 5.0: the
     * OS setting can no longer be ignored (`'no-preference'` was removed).
     */
    reducedMotion?: 'user' | 'reduce';
    /**
     * Global motion intensity (v2.7): `'low'` (shorter, calmer), `'normal'`
     * (default) or `'high'`. Scales every component animation's duration and
     * sets `--usa-motion` (0.6 / 1 / 1.25) on `<html>` for your own CSS. 5.0:
     * `'off'` was removed — use `motionSensitivity: 'minimal'`.
     */
    motionIntensity?: MotionIntensity;
    /**
     * Motion-sensitivity level (v4.4), finer than reduced motion:
     * `'full'` (default) · `'gentle'` (no spins, zooms, skews or parallax —
     * translations and fades only, safe for vestibular disorders) ·
     * `'minimal'` (fades only; components use their reduced-motion variants) ·
     * `'static'` (no animation: every component shows its static alternative).
     * See `setMotionSensitivity()` in `motionary/components/a11y`.
     */
    motionSensitivity?: MotionSensitivity;
}
type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
declare const MOTION_SENSITIVITY_LEVELS: readonly MotionSensitivity[];
type MotionIntensity = 'low' | 'normal' | 'high';
declare const MOTION_SCALE: Record<MotionIntensity, number>;
/** Change global component settings (call before `define*()` for `injectStyles`). */
declare function configureComponents(options: ComponentsConfig): void;
/** The current motion-sensitivity level (v4.4). */
declare function getMotionSensitivity(): MotionSensitivity;
/**
 * Adapt keyframes to the sensitivity level: `gentle` drops transforms that
 * spin, zoom or skew (and 3D), `minimal` keeps opacity only, `static` keeps
 * just the final frame. `full` returns them unchanged.
 */
declare function adaptKeyframes(frames: Keyframe[], level?: MotionSensitivity): Keyframe[];
/** Run `fn` without 4.9 deprecation warnings (library-internal calls). */
declare function withoutDeprecations<T>(fn: () => T): T;
/** The current global motion intensity. */
declare function getMotionIntensity(): MotionIntensity;
/** Duration multiplier for the current intensity (1 when `normal`). */
declare function motionScale(): number;
/** `true` when animations should be reduced (OS setting or `configureComponents`). */
declare function prefersReducedMotion(): boolean;
type Cleanup$1 = () => void;
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
 * `el.animate()` with the library's motion rules (5.0, shared by elements and
 * registered effects): motion sensitivity (keyframes adapted, `static` →
 * final frame), intensity (duration scale) and the animation budget. Returns
 * `null` (final frame applied) when nothing should animate.
 */
declare function animateWithMotion(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation | null;
/** Run `fn(time, dt)` every frame on the shared scheduler until the returned function is called. */
declare function onFrame(fn: (t: number, dt: number) => void): () => void;
/** Scheduler counters: frames flushed, callbacks run, peak callbacks in one frame, pending now. */
declare function schedulerStats(): {
    frames: number;
    callbacks: number;
    peak: number;
    pending: number;
    loops: number;
};
/** Number of component animations running right now. */
declare const activeAnimations: () => number;
/** Cap concurrent component animations; extra ones jump to their final frame (`Infinity` = no cap). */
declare function setAnimationBudget(max: number): void;
/** The current cap. */
declare const animationBudget: () => number;

/** Entrance effects shared by `<usa-reveal>` and `<usa-stagger>` (transform / opacity / filter only). */
declare const REVEAL_EFFECTS: readonly ["fade", "fade-up", "fade-down", "fade-left", "fade-right", "zoom-in", "zoom-out", "blur", "blur-up", "flip-up", "flip-left", "rise"];
type RevealEffect = (typeof REVEAL_EFFECTS)[number];
/** Keyframes from the effect to the natural state. */
declare function revealKeyframes(effect: string, distance?: number): Keyframe[];

/**
 * `<usa-reveal>` — reveals its content when it scrolls into view.
 *
 * Attributes: `effect` (see {@link RevealEffect}, default `fade-up`),
 * `duration` (ms, 700), `delay` (ms, 0), `distance` (px, 32), `easing`,
 * `threshold` (0–1, 0.15), `root-margin`, `repeat` (hide again when it
 * leaves, replay on re-entry). Events: `usa:enter`, `usa:leave`, `usa:complete`.
 */
interface UsaRevealElement extends UsaElement {
    effect: RevealEffect | string;
    /** Play the entrance now (also called automatically on enter). */
    reveal(): Promise<void>;
    /** Hide again so the next `reveal()` replays the entrance. */
    reset(): void;
    readonly revealed: boolean;
}
declare function defineReveal(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-stagger>` — reveals its direct children one after another when the
 * list scrolls into view.
 *
 * Attributes: `effect` (default `fade-up`), `interval` (ms between children,
 * 70), `duration` (600), `delay` (0), `distance` (24), `easing`,
 * `threshold` (0.1), `repeat`. Events: `usa:enter`, `usa:complete`.
 */
interface UsaStaggerElement extends UsaElement {
    reveal(): Promise<void>;
    reset(): void;
}
declare function defineStagger(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-scroll-progress>` — a reading-progress bar.
 *
 * Attributes: `target` (CSS selector of an article to track; default the
 * whole page), `position` (`top` | `bottom` | `inline`, default `top`),
 * `label` (accessible name, default "Reading progress"). Style with
 * `--usa-progress-color`, `--usa-progress-height`, `--usa-progress-track`.
 * Exposes the progress (0–1) as `--usa-progress` on the element and as the
 * `progress` property. Event: `usa:progress` (`detail.progress`).
 *
 * Writes only `transform: scaleX()` (compositor-friendly); reads layout
 * once per animation frame, and only while scrolling.
 */
interface UsaScrollProgressElement extends UsaElement {
    readonly progress: number;
    /** Re-measure (e.g. after content loaded). */
    update(): void;
}
/** Progress (0–1) of `target` scrolling through the viewport, or of the page. */
declare function readScrollProgress(target?: Element | null): number;
declare function defineScrollProgress(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-scrolly>` — sticky scrollytelling. A child marked `data-sticky`
 * stays pinned while the `[data-step]` children scroll past; the step that
 * crosses the trigger line becomes active.
 *
 * Attributes: `offset` (trigger line as a fraction of the viewport height,
 * default 0.5), `active` (reflected index of the active step). The active
 * step gets `data-active`; the host gets `--usa-step` and `data-step-name`
 * (the step's `data-step` value). Event: `usa:step` (`detail.index`,
 * `detail.step`, `detail.name`).
 */
interface UsaScrollyElement extends UsaElement {
    readonly active: number;
    readonly steps: HTMLElement[];
}
declare function defineScrolly(tag?: string): CustomElementConstructor | undefined;

/**
 * motionary/components/reveal — entrance & scroll reveal components.
 * `<usa-reveal>`, `<usa-stagger>`, `<usa-scroll-progress>`, `<usa-scrolly>`.
 */

/** Register every component of this category under its default tag. */
declare function defineRevealComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-reveal': UsaRevealElement;
        'usa-stagger': UsaStaggerElement;
        'usa-scroll-progress': UsaScrollProgressElement;
        'usa-scrolly': UsaScrollyElement;
    }
}

/**
 * `<usa-typewriter>` — types text character by character, optionally cycling
 * through several phrases (typing, pausing, deleting).
 *
 * Attributes: `text` (default: the element's text), `words` (phrases
 * separated by `|`, overrides `text`), `speed` (ms per character, 55),
 * `delete-speed` (ms, 30), `pause` (ms before deleting, 1400), `delay`
 * (ms, 0), `loop`, `cursor="false"` to hide the caret, `start`
 * (`view` | `load` | `manual`, default `view`). The full text is exposed to
 * assistive tech via `aria-label`. Event: `usa:complete` (one pass done).
 * Reduced motion: the text appears at once.
 */
interface UsaTypewriterElement extends UsaElement {
    /** Phrases being typed. */
    readonly phrases: string[];
    start(): void;
    stop(): void;
    restart(): void;
}
declare function defineTypewriter(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-split-text>` — splits its text into words or characters and reveals
 * them in a cascade (pure CSS animation per unit, transform / opacity /
 * filter only). Words never break across lines.
 *
 * 4.3: `Intl.Segmenter`-aware (emoji, CJK words), Arabic-script words are
 * never split below the word, `by="lines"` reveals line by line, and `from`
 * (`start` · `end` · `center` · `edges` · `random`) sets the cascade order.
 *
 * Attributes: `by` (`chars` | `words` | `lines`, default `chars`), `effect`
 * (`rise` | `fade` | `blur` | `flip` | `pop`, default `rise`), `stagger`
 * (ms between units, 28 for chars / 70 for words), `duration` (ms, 620),
 * `delay` (ms, 0), `trigger` (`view` | `load` | `manual`, default `view`),
 * `repeat`. The original text stays readable via `aria-label`.
 * Event: `usa:complete`.
 */
interface UsaSplitTextElement extends UsaElement {
    readonly units: HTMLElement[];
    play(): void;
    reset(): void;
}
declare function defineSplitText(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-scramble>` — "decodes" text out of random glyphs, left to right.
 *
 * Attributes: `text` (default: the element's text), `duration` (ms, 900),
 * `chars` (glyph set), `trigger` (`view` | `hover` | `load` | `manual`,
 * default `view`). Spaces and punctuation stay in place. Uses a monospace-
 * friendly fixed width per glyph only if you style it so; the element sets
 * nothing that causes reflow beyond its own text. Event: `usa:complete`.
 * Reduced motion: shows the final text.
 */
interface UsaScrambleElement extends UsaElement {
    play(): Promise<void>;
}
/** One frame of the scramble: the first `progress` share is resolved. */
declare function scrambleFrame(text: string, progress: number, glyphs?: string, rnd?: () => number): string;
declare function defineScramble(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-counter>` — counts up (or down) to a number when it scrolls into view.
 *
 * Attributes: `to` (target, required), `from` (0), `duration` (ms, 1600),
 * `decimals` (0), `locale` (default: the document language), `prefix`,
 * `suffix`, `grouping="false"` (no thousands separators), `start`
 * (`view` | `load` | `manual`). Setting the `value` property animates from
 * the current value — handy for live dashboards. Uses tabular digits so
 * the width does not jump. Event: `usa:complete`. Reduced motion: jumps.
 */
interface UsaCounterElement extends UsaElement {
    /** Current target; setting it animates to the new number. */
    value: number;
    /** Animate to `to` (default: the `to` attribute). */
    play(to?: number): Promise<void>;
    format(n: number): string;
}
/** easeOutExpo */
declare const easeOutExpo: (t: number) => number;
declare function defineCounter(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-shimmer-text>` — a light sweep across gradient-filled text (CSS
 * only; the element just maps attributes to custom properties).
 *
 * Attributes: `duration` (ms, 2600), `color` (base text colour), `shine`
 * (highlight colour), `angle` (deg, 110). Or style `--usa-shimmer-*`
 * directly. Reduced motion: static gradient text.
 */
type UsaShimmerTextElement = UsaElement;
declare function defineShimmerText(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-text-rotate>` — cycles through words in place ("Build *fast* /
 * *small* / *typed* apps"). All words share one grid cell, so the width is
 * that of the longest word and nothing around it reflows.
 *
 * Attributes: `words` (separated by `|`, default: the element's text split
 * on `|`), `interval` (ms, 2200), `effect` (`slide` | `fade` | `flip` |
 * `blur`, default `slide`), `paused`. Pauses while off-screen and on hover
 * is not needed. Event: `usa:change` (`detail.index`, `detail.word`).
 * Reduced motion: words still change, without movement (fade only).
 */
interface UsaTextRotateElement extends UsaElement {
    readonly index: number;
    next(): void;
}
declare function defineTextRotate(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-wave-text>` — letters bob in a travelling wave.
 * Attributes: `amplitude` (em, 0.25), `speed` (s per cycle, 1.6), `stagger`
 * (s between letters, 0.06). Reduced motion: still text.
 */
interface UsaWaveTextElement extends UsaElement {
}
declare function defineWaveText(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-glitch>` — an RGB-split glitch on its text (`trigger="always"`
 * default, or `hover`). Attributes: `intensity` (px, 3), `trigger`.
 * Reduced motion: no animation (plain text).
 */
interface UsaGlitchElement extends UsaElement {
}
declare function defineGlitch(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-gradient-text>` — text filled with a flowing multi-colour gradient.
 * Attributes: `colors` (comma list), `speed` (s, 6), `angle` (deg, 90).
 * Reduced motion: a static gradient.
 */
interface UsaGradientTextElement extends UsaElement {
}
declare function defineGradientText(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-handwriting>` — the text draws itself stroke by stroke (SVG text
 * outline), then fills in, when it scrolls into view.
 * Attributes: `text`, `duration` (ms, 2400), `stroke` (colour), `size` (px,
 * 64), `font` (family; a script font looks best). Events: `usa:complete`.
 * Reduced motion: the filled text appears at once.
 */
interface UsaHandwritingElement extends UsaElement {
    play(): void;
}
declare function defineHandwriting(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-scroll-highlight>` — reading highlight: words light up one by one
 * as the paragraph scrolls through the viewport (`mode="words"`, default),
 * or a highlighter marker sweeps behind the text on enter (`mode="marker"`).
 * Attributes: `mode`, `color` (marker), `dim` (opacity of unread words,
 * 0.2). Reduced motion: fully highlighted text.
 */
interface UsaScrollHighlightElement extends UsaElement {
    readonly progress: number;
}
declare function defineScrollHighlight(tag?: string): CustomElementConstructor | undefined;

/**
 * Where a step starts on a timeline:
 * - a number: absolute time in ms
 * - `'>'` (default): when the previous step ends · `'<'`: when it starts
 * - `'+=200'` / `'-=200'`: after / overlapping the previous end
 * - `'<+=100'`: 100ms after the previous step's start
 * - `'intro'` / `'intro+=150'`: at (or relative to) a label
 */
type TimelinePosition = number | string;
interface TimelineStepOptions {
    /** Duration in ms or a motion token name (`'fast'`, `'slow'`…; 4.2). Default: timeline default, 600. */
    duration?: number | string;
    /** CSS easing or a motion token name (`'emphasized'`, `'spring'`…; 4.2). Default `cubic-bezier(0.22, 1, 0.36, 1)`. */
    easing?: string;
    /** Start position, see `TimelinePosition`. */
    at?: TimelinePosition;
    /** ms between targets when the selector matches several elements. */
    stagger?: number;
}
interface TimelineOptions {
    /** Defaults for every step. */
    defaults?: Pick<TimelineStepOptions, 'duration' | 'easing' | 'stagger'>;
    /** Playback rate (1 = normal). */
    speed?: number;
    /** Called after `play()` reaches the end (or the start when reversed). */
    onComplete?: () => void;
    /** Called on every frame with progress 0–1. */
    onUpdate?: (progress: number) => void;
}
interface ScrubOptions {
    /** Scroll offset (px) before the source's top reaches the viewport bottom where progress starts (JS engine only). */
    offset?: number;
    /** Smoothing 0–1 (0 = immediate, default 0). Smoothing needs the JS engine. */
    smooth?: number;
    /**
     * 4.1: which progress source drives the timeline.
     * - `'view'` (default): `source` moving through the viewport (CSS `ViewTimeline`, range `cover`).
     * - `'scroll'`: the scroll position of `source` itself (a scroll container; CSS `ScrollTimeline`).
     */
    source?: 'view' | 'scroll';
    /** 4.1: `'auto'` (default) uses the browser's native scroll-driven animations when available, `'js'` forces the fallback. */
    engine?: 'auto' | 'native' | 'js';
    /** 4.1: scroll axis, `'block'` (default) · `'inline'` · `'x'` · `'y'`. */
    axis?: 'block' | 'inline' | 'x' | 'y';
}
/** The function `scrub()` returns: call it to stop. `native` tells which engine runs it. */
interface ScrubHandle {
    (): void;
    /** `true` when the browser's ScrollTimeline / ViewTimeline drives it (compositor, no JS per frame). */
    readonly native: boolean;
}
/** 4.1: whether `scrub()` can use native ScrollTimeline / ViewTimeline here. */
declare function supportsNativeScrub(source?: 'view' | 'scroll'): boolean;
interface Timeline {
    /** Total length in ms. */
    readonly duration: number;
    /** Label positions in ms. */
    readonly labels: Readonly<Record<string, number>>;
    /** Current playhead in ms. */
    readonly time: number;
    /** Add a step: animate `target` with keyframes or a preset name (`fade-up`, `scale`…). */
    to(target: string | Element | Element[] | NodeList, frames: Keyframe[] | string, options?: TimelineStepOptions): Timeline;
    /** Name a position (default: the current end). */
    label(name: string, at?: TimelinePosition): Timeline;
    /** Run `fn` when the playhead passes `at`. */
    call(fn: () => void, at?: TimelinePosition): Timeline;
    /** Play forwards from the playhead (from 0 when at the end). Resolves at the end. */
    play(from?: TimelinePosition): Promise<void>;
    /** Play backwards to 0. */
    reverse(): Promise<void>;
    pause(): Timeline;
    /** Jump to a time (ms) or label. */
    seek(to: TimelinePosition): Timeline;
    /** Get or set progress 0–1. */
    progress(p?: number): number;
    /**
     * Tie progress to scroll: `source` moving through the viewport (or, with
     * `{ source: 'scroll' }`, a scroll container's own position). Runs on native
     * ScrollTimeline / ViewTimeline when available (and no `smooth`, `offset`,
     * `call()` cues or `onUpdate` need JS), else on a rAF-throttled listener.
     * Returns a stop function with a `native` flag.
     */
    scrub(source: Element, options?: ScrubOptions): ScrubHandle;
    /** Stop and drop every animation (elements keep their last frame). */
    cancel(): void;
}
/** Keyframe presets usable by name in `to()` and `data-tl`. */
declare const TIMELINE_PRESETS: Record<string, Keyframe[]>;
/** Resolve a position against the previous step and labels (pure). */
declare function resolvePosition(pos: TimelinePosition | undefined, end: number, prevStart: number, labels?: Record<string, number>): number;
/**
 * Choreograph animations on one clock: chain, overlap, label, seek, reverse and
 * scrub them with scroll. Built on WAAPI (paused animations driven by one
 * playhead); without WAAPI or under reduced motion it jumps to the end state.
 *
 * @example
 * const tl = timeline({ defaults: { duration: 500 } })
 *   .to('.title', 'fade-up')
 *   .label('cards')
 *   .to('.card', 'scale', { stagger: 80, at: '-=200' })
 *   .to('.cta', [{ opacity: 0 }, { opacity: 1 }], { at: 'cards+=400' });
 * tl.play();             // or tl.scrub(document.querySelector('.hero'))
 */
declare function timeline(options?: TimelineOptions): Timeline;

/**
 * `splitText()` (4.3) — split an element's text into characters, words and / or
 * lines, ready for per-unit choreography with `timeline()`.
 *
 * - Grapheme- and word-aware via `Intl.Segmenter` when available: emoji and
 *   combining marks stay whole; Chinese / Japanese / Korean text is split into
 *   real words (or one unit per character without `Segmenter`).
 * - RTL aware: Arabic-script text (cursive, letters join) is never split
 *   below the word, so shaping is preserved; Hebrew and other RTL scripts
 *   split per character. Units stay in logical (reading) order.
 * - Nested inline markup (`<em>`, `<a>`, `<br>`) is preserved.
 * - Accessible: the original text stays available to assistive tech via a
 *   visually hidden copy; the split spans are `aria-hidden`.
 */
type SplitBy = 'char' | 'word' | 'line';
interface SplitTextOptions {
    /** What to split into: `'char'`, `'word'`, `'line'` or several, e.g. `['word', 'line']`. Default `'char'` (words are always wrapped too). */
    by?: SplitBy | SplitBy[] | string;
    /** Locale for `Intl.Segmenter` (default: the element's `lang`, else the document's). */
    locale?: string;
    /** Class prefix (default `usa-split`): units get `usa-split-char` / `-word` / `-line`. */
    className?: string;
}
interface SplitResult {
    chars: HTMLElement[];
    words: HTMLElement[];
    lines: HTMLElement[];
    /** `'rtl'` or `'ltr'` — the direction the split ran in. */
    direction: 'ltr' | 'rtl';
    /** Re-measure lines (call after a resize or font load). */
    relayout(): HTMLElement[];
    /** Restore the original markup. */
    revert(): void;
}
/** Scripts whose letters join (splitting them would break shaping). */
declare const JOINING_SCRIPT: RegExp;
/** Grapheme clusters of `s` (emoji / combining marks stay whole). */
declare function graphemes(s: string, locale?: string): string[];
/**
 * Word-ish tokens of `s`, whitespace kept as separate tokens. CJK text is
 * segmented into words with `Intl.Segmenter`, or per character without it.
 */
declare function words(s: string, locale?: string): string[];
declare function splitText(el: HTMLElement, options?: SplitTextOptions): SplitResult;
type SplitFrom = 'start' | 'end' | 'center' | 'edges' | 'random';
/** Order indices `0…n-1` by choreography: from the start, end, center outwards, edges inwards, or random (seeded). */
declare function splitOrder(n: number, from?: SplitFrom, seed?: number): number[];
interface SplitTimelineOptions extends SplitTextOptions {
    /** Which units to animate (default: the finest in `by`). */
    unit?: 'char' | 'word' | 'line';
    /** Timeline preset name or keyframes (default `'fade-up'`). */
    preset?: string | Keyframe[];
    /** ms between units (default 30 for chars, 80 for words, 140 for lines). */
    stagger?: number;
    /** Duration per unit in ms or a motion token name (default 500). */
    duration?: number | string;
    easing?: string;
    /** Choreography order (default `'start'` — reading order, also for RTL). */
    from?: SplitFrom;
}
/**
 * Split `el` and build a `timeline()` with one step per unit — play it,
 * `scrub()` it with scroll, `reverse()` or `seek()` it.
 *
 * ```ts
 * const { timeline: tl } = splitTimeline(h1, { by: 'char', preset: 'blur', from: 'center' });
 * tl.play();
 * ```
 */
declare function splitTimeline(el: HTMLElement, options?: SplitTimelineOptions): {
    split: SplitResult;
    timeline: Timeline;
};

/**
 * motionary/components/text — text effects.
 * `<usa-typewriter>`, `<usa-split-text>`, `<usa-scramble>`, `<usa-counter>`,
 * `<usa-shimmer-text>`, `<usa-text-rotate>`.
 */

/** Register every component of this category under its default tag. */
declare function defineTextComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-wave-text': UsaWaveTextElement;
        'usa-glitch': UsaGlitchElement;
        'usa-gradient-text': UsaGradientTextElement;
        'usa-handwriting': UsaHandwritingElement;
        'usa-scroll-highlight': UsaScrollHighlightElement;
        'usa-typewriter': UsaTypewriterElement;
        'usa-split-text': UsaSplitTextElement;
        'usa-scramble': UsaScrambleElement;
        'usa-counter': UsaCounterElement;
        'usa-shimmer-text': UsaShimmerTextElement;
        'usa-text-rotate': UsaTextRotateElement;
    }
}

/**
 * `<usa-ripple>` — an ink ripple from the pointer (or the centre, for
 * keyboard presses) on whatever it wraps: buttons, list items, cards.
 *
 * Attributes: `color` (default `currentColor`), `opacity` (0.22),
 * `duration` (ms, 550), `centered`, `disabled`. Clips its content to its
 * own border radius. Reduced motion: a brief highlight instead of the wave.
 */
interface UsaRippleElement extends UsaElement {
    /** Spawn a ripple at client coordinates (default: centre). */
    ripple(x?: number, y?: number): void;
}
declare function defineRipple(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-magnetic>` — its content leans toward the pointer when the pointer
 * comes near, and springs back when it leaves (great for CTAs and icons).
 *
 * Attributes: `strength` (0–1 share of the pointer offset, 0.35), `radius`
 * (px of attraction beyond the element's edge, 60), `disabled`. Only on
 * devices with a fine pointer that hovers; off under reduced motion.
 * Writes one `transform` per frame through `--usa-mx` / `--usa-my`.
 */
type UsaMagneticElement = UsaElement;
declare function defineMagnetic(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-tilt>` — a 3D card that tilts toward the pointer, with an optional
 * glare highlight that follows it.
 *
 * Attributes: `max` (deg, 10), `scale` (1.03 while hovered), `perspective`
 * (px, 900), `glare` (add the light reflection), `reverse` (tilt away),
 * `disabled`. Off under reduced motion. Exposes `--usa-tilt-x` /
 * `--usa-tilt-y` (−1…1) for parallax layers inside the card.
 */
type UsaTiltElement = UsaElement;
declare function defineTilt(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-spotlight>` — the Windows Fluent "Reveal highlight": a soft light
 * follows the pointer across a group of items, lighting up their borders
 * (even of neighbours) and the background of the hovered one. Put buttons,
 * tiles or menu items inside; each direct child is an item (or mark items
 * with `data-spotlight` to pick them yourself).
 *
 * Attributes: `size` (px, radius of the light, 160), `color` (default a
 * translucent white), `border` (px width of the lit border, 1),
 * `no-fill` (only light the borders). Not a motion effect, so it stays on
 * under reduced motion; off on touch-only devices.
 */
type UsaSpotlightElement = UsaElement;
declare function defineSpotlight(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-press>` — tactile press feedback: content dips while pressed and
 * springs back on release (the Fluent "pointer down" scale), or bounces once
 * on click with `bounce`.
 *
 * Attributes: `scale` (pressed scale, 0.95), `bounce` (overshoot on
 * release), `disabled`. Works with mouse, touch, pen and Space/Enter.
 * Reduced motion: a subtle dim instead of scaling.
 */
interface UsaPressElement extends UsaElement {
    readonly pressed: boolean;
}
declare function definePress(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-toggle>` — an accessible switch whose knob stretches while pressed
 * and glides across (the Windows 11 / iOS toggle). `role="switch"`,
 * keyboard (Space / Enter), and form-associated where `ElementInternals`
 * exists (submits `value`, default `"on"`, under `name` when checked).
 *
 * Attributes: `checked`, `disabled`, `name`, `value`, `label`
 * (accessible name if there is no `aria-label` / `<label>`). Events:
 * `change` and `usa:change` (`detail.checked`). Reduced motion: no glide.
 */
interface UsaToggleElement extends UsaElement {
    checked: boolean;
    disabled: boolean;
    toggle(force?: boolean): void;
}
declare function defineToggle(tag?: string): CustomElementConstructor | undefined;

/**
 * motionary/components/interaction — micro-interactions.
 * `<usa-ripple>`, `<usa-magnetic>`, `<usa-tilt>`, `<usa-spotlight>`,
 * `<usa-press>`, `<usa-toggle>`.
 */

/** Register every component of this category under its default tag. */
declare function defineInteractionComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-ripple': UsaRippleElement;
        'usa-magnetic': UsaMagneticElement;
        'usa-tilt': UsaTiltElement;
        'usa-spotlight': UsaSpotlightElement;
        'usa-press': UsaPressElement;
        'usa-toggle': UsaToggleElement;
    }
}

declare const SPINNER_VARIANTS: readonly ["fluent", "windows", "ring", "dots", "pulse", "bars"];
type SpinnerVariant = (typeof SPINNER_VARIANTS)[number];
/**
 * `<usa-spinner>` — indeterminate loading indicators, pure CSS animations
 * of `transform` / `opacity` (plus an SVG stroke for `fluent`).
 *
 * Kinds (`kind`): `fluent` (default — the WinUI / Windows 11
 * ProgressRing arc), `windows` (the Windows 10 boot "orbiting dots"),
 * `ring` (classic border spinner), `dots` (three bouncing dots / typing
 * indicator), `pulse` (expanding ripple), `bars` (equalizer).
 * Attributes: `size` (px, 32), `label` (accessible name, "Loading"),
 * `paused`. Colour follows `color` / `--usa-spinner-color`.
 * `role="progressbar"` without a value (indeterminate). Reduced motion:
 * a slow opacity pulse instead of movement.
 */
interface UsaSpinnerElement extends UsaElement {
    /** Spinner kind (`kind` attribute). */
    kind: SpinnerVariant;
}
declare function defineSpinner(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-skeleton>` — shimmering placeholders while content loads. With
 * `loading`, it shows `lines` bars (or one block of `width` × `height`,
 * or a `circle`) and hides its children; remove `loading` and the real
 * content fades in.
 *
 * Attributes: `loading`, `lines` (3), `width`, `height` (CSS lengths),
 * `circle`, `radius`, `avatar` (circle + lines, like a list row).
 * `aria-busy` follows `loading`. Reduced motion: no shimmer sweep.
 */
interface UsaSkeletonElement extends UsaElement {
    loading: boolean;
}
declare function defineSkeleton(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-progress>` — a linear progress bar. Determinate (`value` / `max`)
 * bars glide between values with `transform: scaleX()`; without a value,
 * or with `indeterminate`, it shows the Windows Fluent indeterminate
 * animation (two sliding segments).
 *
 * Attributes: `value`, `max` (100), `indeterminate`, `state`
 * (`paused` | `error` — the WinUI states), `label` (accessible name).
 * `role="progressbar"` with `aria-valuenow` when determinate.
 * Reduced motion: no glide; indeterminate becomes a gentle pulse.
 */
interface UsaProgressElement extends UsaElement {
    value: number | null;
    max: number;
    /** 0–1, or `null` when indeterminate. */
    readonly ratio: number | null;
}
declare function defineProgress(tag?: string): CustomElementConstructor | undefined;

type ToastType = 'info' | 'success' | 'warning' | 'error';
interface ToastOptions {
    /** ms before it hides itself; `0` keeps it until closed (default 4000). */
    duration?: number;
    type?: ToastType;
    /** Optional action button. */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Show a close button (default `true`). */
    dismissible?: boolean;
    /** The toaster to use (default: the first `<usa-toaster>`, created if missing). */
    toaster?: UsaToasterElement | string;
}
interface ToastHandle {
    element: HTMLElement;
    close(): Promise<void>;
}
/**
 * `<usa-toaster>` — the region toasts slide into (`role="region"`, each
 * toast `role="status"`, errors `role="alert"`). Toasts pause their timer
 * while hovered or focused, and the stack re-flows with a FLIP animation.
 *
 * Attributes: `position` (`bottom-right` default, `bottom-left`,
 * `bottom-center`, `top-right`, `top-left`, `top-center`), `max` (visible
 * toasts, 4), `label` (region name, "Notifications").
 * Reduced motion: toasts fade instead of sliding.
 */
interface UsaToasterElement extends UsaElement {
    show(message: string, options?: ToastOptions): ToastHandle;
    clear(): void;
}
declare function defineToaster(tag?: string): CustomElementConstructor | undefined;
/**
 * Show a toast. Defines `<usa-toaster>` and adds one to `<body>` if the
 * page has none. Returns a handle with `close()`. No-op on the server.
 *
 * ```js
 * toast('Saved', { type: 'success' });
 * ```
 */
declare function toast(message: string, options?: ToastOptions): ToastHandle | null;

/**
 * `<usa-check>` — an animated result icon: the circle draws itself, then the
 * check mark (or cross / exclamation) strokes in with a little pop.
 *
 * Attributes: `kind` (`success` default, `error`, `warning`), `size`
 * (px, 56), `start` (`view` default | `load` | `manual`), `label`
 * (accessible name, e.g. "Payment complete"; the icon is decorative
 * without it). Event: `usa:complete`. Reduced motion: drawn instantly.
 */
interface UsaCheckElement extends UsaElement {
    play(): Promise<void>;
    reset(): void;
}
declare function defineCheck(tag?: string): CustomElementConstructor | undefined;

/**
 * motionary/components/feedback — loading & feedback.
 * `<usa-spinner>`, `<usa-skeleton>`, `<usa-progress>`, `<usa-toaster>` +
 * `toast()`, `<usa-check>`.
 */

/** Register every component of this category under its default tag. */
declare function defineFeedbackComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-spinner': UsaSpinnerElement;
        'usa-skeleton': UsaSkeletonElement;
        'usa-progress': UsaProgressElement;
        'usa-toaster': UsaToasterElement;
        'usa-check': UsaCheckElement;
    }
}

/**
 * `<usa-aurora>` — a slow, drifting aurora / gradient-mesh backdrop behind
 * its content. Soft radial gradients moved with `transform` only (no
 * animated blur), paused while off-screen.
 *
 * Attributes: `colors` (comma-separated, default violet / cyan / pink),
 * `speed` (multiplier, 1), `intensity` (0–1 opacity, 0.7), `paused`.
 * Reduced motion: a still gradient.
 */
type UsaAuroraElement = UsaElement;
declare function defineAurora(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-particles>` — a canvas of drifting particles, optionally linked by
 * lines when close (a "constellation"), that drift away from the pointer.
 * Fills its own box (place it as a background with
 * `position: absolute; inset: 0`, or give it a height).
 *
 * Attributes: `count` (60; scaled down on small boxes), `color`
 * (default `currentColor`), `size` (max radius px, 2.2), `speed` (0.35),
 * `links` (max link distance px, 110; `0` disables), `interactive`,
 * `paused`. Renders only while visible and the tab is shown, at device
 * pixel ratio ≤ 2. Reduced motion: one still frame.
 */
interface UsaParticlesElement extends UsaElement {
    /** Re-seed the particles. */
    reset(): void;
}
declare function defineParticles(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-grain>` — a film-grain / noise overlay on top of its content
 * (SVG `feTurbulence` texture, no images to ship). With `animated`, the
 * grain jitters like film (stepped `transform`, ~12 fps).
 *
 * Attributes: `opacity` (0.12), `animated`, `blend` (`mix-blend-mode`,
 * default `overlay`), `scale` (texture size px, 180). Never intercepts
 * pointer events. Reduced motion: static grain.
 */
type UsaGrainElement = UsaElement;
declare function defineGrain(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-marquee>` — an infinite, seamless ticker of its children (logos,
 * testimonials, tags). The content is cloned (clones are `aria-hidden` and
 * `inert`) and the track slides with one WAAPI `transform` animation whose
 * duration follows the measured width, so the speed is constant.
 *
 * Attributes: `speed` (px/s, 50), `direction` (`left` default | `right` |
 * `up` | `down`), `gap` (px, 32), `pause-on-hover`, `fade` (soft edges),
 * `paused`. Pauses off-screen. Reduced motion: no movement; the row
 * becomes scrollable instead.
 */
interface UsaMarqueeElement extends UsaElement {
    pause(): void;
    resume(): void;
}
declare function defineMarquee(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-acrylic>` — Windows Fluent materials for the web: `acrylic`
 * (frosted glass: backdrop blur + saturation + tint + subtle noise) and
 * `mica` (an opaque, wallpaper-tinted base for app backgrounds; on the web it
 * tints from `--usa-mica-source`, a gradient you control). Optional
 * `shimmer` adds a light sweep when it appears or on hover.
 *
 * Attributes: `kind` (`acrylic` default | `mica`), `tint` (colour),
 * `tint-opacity` (0–1, 0.55), `blur` (px, 30), `shimmer`
 * (`hover` | `load` | `none`, default `none`). Falls back to a solid tint
 * without `backdrop-filter` and under `prefers-reduced-transparency` or
 * forced colours, like Windows does when transparency effects are off.
 */
type UsaAcrylicElement = UsaElement;
declare function defineAcrylic(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-grid-glow>` — a line grid behind its content that lights up around
 * the pointer. Attributes: `size` (cell px, 32), `color`, `radius` (px, 220).
 * Reduced motion: the grid stays, a soft static glow in the centre.
 */
interface UsaGridGlowElement extends UsaElement {
}
declare function defineGridGlow(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-blobs>` — soft, slowly morphing colour blobs (fluid gradient
 * backdrop). Attributes: `colors` (comma list), `speed` (1), `blur` (px, 60).
 * Reduced motion: still blobs.
 */
interface UsaBlobsElement extends UsaElement {
}
declare function defineBlobs(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-water-ripple>` — interactive water ripples on a canvas over its
 * content (pointer moves and taps disturb the surface). Low-resolution height
 * map, paused off-screen. Attributes: `damping` (0.96), `strength` (1),
 * `color` (highlight). Reduced motion: nothing is drawn.
 */
interface UsaWaterRippleElement extends UsaElement {
    drop(x: number, y: number, strength?: number): void;
}
declare function defineWaterRipple(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-dot-network>` — a grid of dots that swell and link up with lines
 * around the pointer (a living network backdrop). Attributes: `gap` (px,
 * 28), `color`, `radius` (px of influence, 140). Reduced motion: a static
 * dot grid.
 */
interface UsaDotNetworkElement extends UsaElement {
}
declare function defineDotNetwork(tag?: string): CustomElementConstructor | undefined;

interface FluentPresetOptions {
    /** Root to apply to (default `document.documentElement`). */
    root?: HTMLElement;
    /** Reveal highlight on interactive elements (default `true`). */
    reveal?: boolean;
    /** Reveal targets (default buttons, links, `[data-fluent-reveal]`). */
    selector?: string;
    /** Mica-style tinted window background on `<body>` (default `true`). */
    mica?: boolean;
}
/**
 * Windows 11 **Fluent preset** (v2.8): applies the `fluent` variant
 * (Segoe UI Variable, Windows accent, 8 px radii), a Mica-style tinted
 * window background, Acrylic on `.usa-acrylic` / `[data-acrylic]`, and
 * Reveal highlight (a light following the pointer on borders and
 * backgrounds of interactive elements). Ideal for WebView2 / Electron /
 * Tauri apps on Windows. Returns a function that removes it.
 * Respects reduced motion / transparency (no Reveal tracking; solid materials).
 */
declare function fluentPreset(options?: FluentPresetOptions): () => void;

/**
 * motionary/components/background — backgrounds & decoration.
 * `<usa-aurora>`, `<usa-particles>`, `<usa-grain>`, `<usa-marquee>`,
 * `<usa-acrylic>`.
 */

/** Register every component of this category under its default tag. */
declare function defineBackgroundComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-grid-glow': UsaGridGlowElement;
        'usa-blobs': UsaBlobsElement;
        'usa-water-ripple': UsaWaterRippleElement;
        'usa-dot-network': UsaDotNetworkElement;
        'usa-aurora': UsaAuroraElement;
        'usa-particles': UsaParticlesElement;
        'usa-grain': UsaGrainElement;
        'usa-marquee': UsaMarqueeElement;
        'usa-acrylic': UsaAcrylicElement;
    }
}

type DialogVariant = 'modal' | 'drawer-start' | 'drawer-end' | 'drawer-bottom' | 'sheet';
/**
 * `<usa-dialog>` — an animated modal or drawer built on the native
 * `<dialog>` (top layer, focus trapping, inert page, Esc to close). Its
 * children are slotted into the panel (they stay in the light DOM, so
 * React / Vue / Svelte keep owning them). Style with `::part(panel)`,
 * `::part(backdrop)` and the `--usa-dialog-*` custom properties.
 *
 * Attributes: `open` (reflects; set/remove to open/close), `kind`
 * (`modal` default — Fluent scale + fade; `drawer-start` / `drawer-end`
 * slide from the side, `drawer-bottom` / `sheet` from below), `label`
 * (accessible name), `no-backdrop-close`, `no-esc`. Elements inside
 * with `data-close` close it. Events: `usa:open`, `usa:close` (cancelable
 * `usa:beforeclose`). Reduced motion: fade only.
 */
interface UsaDialogElement extends UsaElement {
    open: boolean;
    show(): Promise<void>;
    close(returnValue?: string): Promise<void>;
    readonly dialog: HTMLDialogElement | null;
    returnValue: string;
}
declare function defineDialog(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-accordion>` — smooth expand / collapse for the native `<details>`
 * elements inside it (keeps their semantics, keyboard support and
 * find-in-page, and adds no wrapper elements, so framework-rendered content
 * is left alone). Only one stays open unless `multiple` is set.
 *
 * Attributes: `multiple`, `duration` (ms, 300). Event: `usa:toggle`
 * (`detail.details`, `detail.open`). Reduced motion: instant.
 * Heights are measured once per toggle and animated on the `<details>`.
 */
interface UsaAccordionElement extends UsaElement {
    readonly items: HTMLDetailsElement[];
    toggleItem(details: HTMLDetailsElement, open?: boolean): Promise<void>;
}
declare function defineAccordion(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-view-switch>` — shows one of its children at a time (tabs, wizard
 * steps, app pages) and animates between them. Children are views; name
 * them with `data-view`, or address them by index.
 *
 * Attributes: `active` (view name or index, default the first),
 * `effect` (`fade` | `slide` (default, direction-aware — Fluent "page
 * transition") | `scale` | `drill`), `duration` (ms, 320). Inactive views
 * get `hidden` + `inert`. Event: `usa:change` (`detail.view`,
 * `detail.index`). Reduced motion: a quick fade.
 */
interface UsaViewSwitchElement extends UsaElement {
    active: string;
    readonly views: HTMLElement[];
    show(view: string | number): Promise<void>;
}
declare function defineViewSwitch(tag?: string): CustomElementConstructor | undefined;

interface ViewTransitionOptions {
    /**
     * Element to cross-fade when the View Transitions API is missing (default:
     * none — the update is applied without animation).
     */
    fallback?: HTMLElement | null;
    /** Fallback fade duration in ms (default 180 out + 220 in). */
    duration?: number;
    /** View transition types (`document.startViewTransition({ types })`, where supported). */
    types?: string[];
}
/**
 * Run `update()` (which changes the DOM) inside a view transition:
 * `document.startViewTransition()` where available (Chrome/Edge 111+, so
 * Electron, WebView2 and Tauri on Windows), otherwise a short cross-fade of
 * `options.fallback`. Instant under reduced motion. Resolves when finished.
 *
 * Give elements a `view-transition-name` in CSS for shared-element morphs.
 */
declare function viewTransition(update: () => void | Promise<void>, options?: ViewTransitionOptions): Promise<void>;
interface FlipOptions {
    duration?: number;
    easing?: string;
    /** Fade/scale in elements that did not exist before (default true). */
    animateEnter?: boolean;
}
type Targets = Element | Iterable<Element> | ArrayLike<Element>;
/**
 * FLIP animation for layout changes (list reorder, filter, grid resize):
 * measures `targets` (an element's children, or a list), runs `mutate()`,
 * then animates each element from its old position to its new one with
 * transforms only. Elements added by `mutate()` fade in.
 *
 * ```js
 * await flip(list, () => list.append(...shuffled));
 * ```
 */
declare function flip(targets: Targets, mutate: () => void | Promise<void>, options?: FlipOptions): Promise<void>;

/**
 * motionary/components/transitions — view & layout transitions.
 * `<usa-dialog>`, `<usa-accordion>`, `<usa-view-switch>`
 * and the `viewTransition()` and `flip()` helpers (4.0: `<usa-flip-list>` → `<usa-auto-animate>`,
 * `connectedAnimation()` → `sharedTransition()`, both in `components/layout`).
 */

/** Register every component of this category under its default tag. */
declare function defineTransitionComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-dialog': UsaDialogElement;
        'usa-accordion': UsaAccordionElement;
        'usa-view-switch': UsaViewSwitchElement;
    }
}

declare const SPRING_EFFECTS: readonly ["bounce-in", "pop", "drop", "jelly", "rubber-band"];
type SpringEffect = (typeof SPRING_EFFECTS)[number];
/** Keyframes of a spring effect (entrances use spring timing, attention effects fixed frames). */
declare function springEffectKeyframes(effect: string, reduced?: boolean): Keyframe[];
/**
 * `<usa-spring>` — spring / bounce effects on its content.
 *
 * Attributes: `effect` (`bounce-in` default, `pop`, `drop`, `jelly`,
 * `rubber-band`), `trigger` (`view` default, `hover`, `click`, `manual`),
 * `preset` (`gentle`, `wobbly`, `stiff`, `bouncy`, …) or `stiffness` /
 * `damping` / `mass`, `delay` (ms), `duration` (ms, attention effects; 900),
 * `repeat` (replay every time it re-enters the view), `block`.
 * Events: `usa:complete`. Reduced motion: entrances fade, attention effects do nothing.
 */
interface UsaSpringElement extends UsaElement {
    effect: string;
    play(): Promise<void>;
    reset(): void;
}
declare function defineSpring(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-draggable>` — drag its content with the pointer (mouse, touch, pen)
 * or the arrow keys; physics on release.
 *
 * Attributes: `axis` (`both` default, `x`, `y`), `spring-back` (return to
 * the origin with a spring), `inertia` (keep gliding after a flick),
 * `snap` (grid size like `80`, or points like `0,120,240`), `bounds`
 * (`parent` = stay inside the parent box, rubber-banding past its edges),
 * `preset` (spring, default `wobbly`), `step` (arrow-key step, px, 16),
 * `disabled`. Methods: `moveTo(x, y, animate?)`, `reset()`. Events:
 * `usa:drag-start`, `usa:drag-end` (`{ x, y, vx, vy }`), `usa:settle`.
 * Reduced motion: positions change instantly (no spring or inertia).
 */
interface UsaDraggableElement extends UsaElement {
    readonly x: number;
    readonly y: number;
    readonly dragging: boolean;
    moveTo(x: number, y: number, animate?: boolean): void;
    reset(): void;
}
declare function defineDraggable(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-overscroll>` — an elastic scroll container: pulling past the top or
 * bottom (touch, trackpad or wheel) stretches the content with iOS-style
 * rubber-band resistance and it springs back on release.
 *
 * Attributes: `axis` (`y` default, `x`), `max` (largest stretch in px, 120),
 * `preset` (spring, default `default`), `disabled`. CSS variable
 * `--usa-overscroll` holds the current offset. Reduced motion: no stretch
 * (a plain scroll container with `overscroll-behavior: contain`).
 */
interface UsaOverscrollElement extends UsaElement {
    /** Current stretch in px (negative = pulled past the end). */
    readonly offset: number;
}
declare function defineOverscroll(tag?: string): CustomElementConstructor | undefined;

/**
 * Spring physics core (v2.3). A damped harmonic oscillator integrated in
 * 1 ms steps: `stiffness` (k, N/m), `damping` (c) and `mass` (m). Used by
 * the `<usa-spring>`, `<usa-draggable>` and `<usa-overscroll>` elements and
 * exported for your own animations:
 *
 * - `springEasing()` turns a spring into a CSS `linear()` easing + duration
 *   for WAAPI / CSS (falls back to a cubic-bezier overshoot where `linear()`
 *   is unsupported);
 * - `spring(el, keyframes, cfg)` animates with it;
 * - `createSpring()` is an interruptible, velocity-preserving value for
 *   gestures (drag, inertia, snap).
 */
interface SpringConfig {
    /** Spring stiffness (default 170). Higher = faster, snappier. */
    stiffness?: number;
    /** Damping / friction (default 26). Lower = more bounces. */
    damping?: number;
    /** Mass (default 1). Higher = slower, heavier. */
    mass?: number;
    /** Initial velocity in progress units per second (default 0). */
    velocity?: number;
    /** Rest threshold (default 0.001). */
    precision?: number;
}
type SpringPreset = 'default' | 'gentle' | 'wobbly' | 'stiff' | 'bouncy' | 'slow' | 'molasses';
declare const SPRING_PRESETS: Record<SpringPreset, Required<Pick<SpringConfig, 'stiffness' | 'damping' | 'mass'>>>;
type SpringInput = SpringPreset | SpringConfig | string | undefined;
/** Resolve a preset name or a partial config to a full config. */
declare function resolveSpring(input?: SpringInput): Required<SpringConfig>;
/** One integration step (semi-implicit Euler) towards `to`. Returns [x, v]. */
declare function stepSpring(cfg: Required<SpringConfig>, x: number, v: number, to: number, dt: number): [number, number];
/**
 * Sample the spring from 0 to 1 at `fps` (default 60). `values` may exceed 1
 * (overshoot); `duration` is the time to rest, in ms (max 10 s).
 */
declare function springSamples(input?: SpringInput, fps?: number): {
    values: number[];
    duration: number;
};
/** `true` when CSS `linear()` easing is supported. */
declare function supportsLinearEasing(): boolean;
/**
 * The spring as `{ easing, duration }` for `el.animate()` / CSS. `easing` is
 * a `linear(…)` function with at most `points` stops (default 48), or a
 * cubic-bezier overshoot where `linear()` is unsupported.
 */
declare function springEasing(input?: SpringInput, points?: number): {
    easing: string;
    duration: number;
};
/** Build a CSS `linear()` easing from samples (down-sampled to `points`). */
declare function linearEasing(values: number[], points?: number): string;
/**
 * Animate `el` between keyframes with spring timing (WAAPI). Under reduced
 * motion the final frame is applied immediately. Returns the Animation (or
 * `null` without WAAPI / under reduced motion).
 */
declare function spring(el: Element, keyframes: Keyframe[], input?: SpringInput, options?: KeyframeAnimationOptions): Animation | null;
interface SpringValueOptions {
    /** Start value (default 0). */
    value?: number;
    /** Spring config or preset (default `'default'`). */
    spring?: SpringInput;
    /** Called with the value every frame (and on `jump()`). */
    onUpdate?: (value: number, velocity: number) => void;
    /** Called when the value comes to rest at its target. */
    onRest?: (value: number) => void;
}
interface SpringValue {
    readonly value: number;
    /** Units per second. */
    readonly velocity: number;
    readonly target: number;
    readonly animating: boolean;
    /** Animate to `target`, optionally with a new initial velocity (units/s). */
    set(target: number, velocity?: number): void;
    /** Jump to `value` with no animation. */
    jump(value: number): void;
    /** Stop where it is. */
    stop(): void;
    /** Change the spring config. */
    configure(spring: SpringInput): void;
}
/**
 * An interruptible spring-animated number: call `set()` as often as you like,
 * the motion keeps its velocity (like iOS / Framer springs). Reduced motion
 * jumps straight to the target.
 */
declare function createSpring(opts?: SpringValueOptions): SpringValue;
/**
 * Where a flick at `velocity` (units/s) comes to rest with exponential
 * decay: `value + velocity · timeConstant` (default 0.325 s, iOS-like).
 */
declare function projectInertia(value: number, velocity: number, timeConstant?: number): number;
/** Snap to a grid (`number`) or the nearest of a list of points. */
declare function snapTo(value: number, to: number | number[] | null | undefined): number;
/** iOS-style rubber-band resistance: how far content moves when pulled `distance` past an edge. */
declare function rubberBand(distance: number, dimension: number, constant?: number): number;

/**
 * motionary/components/physics — spring & bounce physics (v2.3).
 * `<usa-spring>` (bounce-in, pop, drop, jelly, rubber-band), `<usa-draggable>`
 * (spring-back, inertia, snap) and `<usa-overscroll>` (elastic edges), plus
 * the spring core: `spring()`, `springEasing()`, `createSpring()`,
 * `SPRING_PRESETS`, `projectInertia()`, `snapTo()`, `rubberBand()`.
 */

/** Register every component of this category under its default tag. */
declare function definePhysicsComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-spring': UsaSpringElement;
        'usa-draggable': UsaDraggableElement;
        'usa-overscroll': UsaOverscrollElement;
    }
}

declare const CARD_EFFECTS: readonly ["flip", "holo", "glass", "border-glow", "conic-border", "lift", "spotlight", "sheen", "parallax-layers", "expand"];
type CardEffect = (typeof CARD_EFFECTS)[number];
/**
 * `<usa-card>` — card effects, combinable: `effect="lift sheen"`.
 *
 * - `flip` — front/back (`[data-front]` / `[data-back]` children) flip on
 *   hover or `trigger="click"`, `axis="y"` (default, horizontal flip) or `x`.
 * - `holo` — holographic foil that shifts with the pointer.
 * - `glass` — frosted glass surface (backdrop blur).
 * - `border-glow` — a glow on the border that follows the pointer.
 * - `conic-border` — a rotating conic-gradient border.
 * - `lift` — rises with a deeper shadow and a slight pointer tilt.
 * - `spotlight` — a soft light that follows the pointer.
 * - `sheen` — a light sweep across the card on hover / focus.
 * - `parallax-layers` — children with `data-depth="0.2…1"` move at different depths.
 * - `expand` — click to grow into a full detail view (`[data-detail]`
 *   content is shown), FLIP + spring; Esc, `[data-close]` or the backdrop closes.
 *
 * Attributes: `effect`, `axis`, `trigger`, `depth` (parallax px, 16),
 * `color` (glow / spotlight colour), `flipped`, `expanded`, `disabled`.
 * CSS variables: `--usa-card-x/-y` (pointer %, 0–100), `--usa-card-nx/-ny` (−1…1).
 * Methods: `flip(force?)`, `expand()`, `collapse()`. Events: `usa:flip`,
 * `usa:expand`, `usa:collapse`. Reduced motion: no tilt / parallax / sweep;
 * flips and expansions cross-fade.
 */
interface UsaCardElement extends UsaElement {
    readonly effects: string[];
    flipped: boolean;
    readonly expanded: boolean;
    flip(force?: boolean): void;
    expand(): Promise<void>;
    collapse(): Promise<void>;
}
declare function defineCard(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-card-stack>` — a deck of cards (its element children). The top card
 * can be swiped away left or right (pointer, touch or arrow keys); the rest
 * fan out behind it and move up with a spring.
 *
 * Attributes: `threshold` (px to dismiss, 90), `visible` (cards fanned
 * behind, 3), `offset` (px between cards, 10), `loop` (swiped cards go back
 * to the bottom), `disabled`. Methods: `swipe(direction)`, `top`. Events:
 * `usa:swipe` (`{ direction: 'left' | 'right', card }`), `usa:empty`.
 * Reduced motion: cards are removed instantly, no rotation.
 */
interface UsaCardStackElement extends UsaElement {
    readonly top: HTMLElement | null;
    swipe(direction: 'left' | 'right'): Promise<void>;
}
declare function defineCardStack(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-sticky-stack>` — cards (element children) stick to the top while
 * scrolling and the ones underneath scale down and dim as the next card
 * slides over them, like a deck building up.
 *
 * Attributes: `top` (px from the viewport top, 80), `gap` (px each card
 * peeks below the previous, 16), `scale` (how much a covered card shrinks,
 * 0.06). Reduced motion: cards still stack (sticky) but do not scale.
 */
interface UsaStickyStackElement extends UsaElement {
    update(): void;
}
declare function defineStickyStack(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-carousel-3d>` — its element children on a 3D ring. Rotate with the
 * arrow keys, a drag/swipe, the wheel (shift) or `next()` / `prev()`; the
 * front item is `aria-current`. Spring-driven rotation.
 *
 * Attributes: `radius` (px, auto from item width), `autoplay` (ms between
 * steps, pauses on hover/focus), `perspective` (px, 1200), `index`.
 * Events: `usa:change` (`{ index }`). Reduced motion: a flat, instant
 * switch (only the current item is shown, others dimmed).
 */
interface UsaCarousel3dElement extends UsaElement {
    index: number;
    next(): void;
    prev(): void;
    goTo(i: number): void;
}
declare function defineCarousel3d(tag?: string): CustomElementConstructor | undefined;

/**
 * motionary/components/cards — card effects (v2.4).
 * `<usa-card effect="flip | holo | glass | border-glow | conic-border | lift |
 * spotlight | sheen | parallax-layers | expand">` (combinable),
 * `<usa-card-stack>` (swipeable deck), `<usa-sticky-stack>` (stacking on
 * scroll) and `<usa-carousel-3d>`.
 */

/** Register every component of this category under its default tag. */
declare function defineCardComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-card': UsaCardElement;
        'usa-card-stack': UsaCardStackElement;
        'usa-sticky-stack': UsaStickyStackElement;
        'usa-carousel-3d': UsaCarousel3dElement;
    }
}

declare const CLICK_EFFECTS: readonly ["ripple", "burst", "confetti", "squish", "press-spring", "shake"];
type ClickEffect = (typeof CLICK_EFFECTS)[number];
/**
 * `<usa-click>` — click / tap effects on whatever it wraps (combinable:
 * `effect="press-spring burst"`).
 *
 * - `ripple` — an ink wave from the pointer (enhanced: `color`, soft edge);
 * - `burst` — particles radiating from the pointer (`shape`: circle, square, star, heart, emoji);
 * - `confetti` — a confetti cannon from the click point;
 * - `squish` — squash on press, stretch on release (spring);
 * - `press-spring` — dips while pressed, springs back with overshoot;
 * - `shake` — horizontal error shake; plays on `invalid` events from a form
 *   inside, on `shake()`, or on click when `trigger="click"`.
 *
 * Attributes: `effect`, `color`, `shape`, `count`, `haptic` (vibrate ms,
 * where supported), `disabled`. Keyboard (Space/Enter) triggers the effects
 * from the centre. Reduced motion: no particles or movement; press dims.
 */
interface UsaClickElement extends UsaElement {
    readonly effects: string[];
    play(x?: number, y?: number): void;
    shake(): void;
}
declare function defineClick(tag?: string): CustomElementConstructor | undefined;

declare const BUTTON_DEFORMS: readonly ["squash", "wobble", "gooey", "dent"];
type ButtonDeform = (typeof BUTTON_DEFORMS)[number];
type ButtonShape = 'pill' | 'circle' | 'icon';
type ButtonState = 'idle' | 'loading' | 'success' | 'error';
/**
 * `<usa-button>` — **button click deformation** (按钮点击形变) around a
 * native `<button>` (or `<a>`) child — or the element itself becomes a button.
 *
 * `deform` (combinable, e.g. `deform="squash wobble"`):
 * - `squash` — squash on press, stretch-and-settle on release (spring);
 * - `wobble` — elastic border-radius wobble after a click;
 * - `gooey` — liquid blob: droplets squeeze out from the press point and
 *   merge back (SVG goo filter);
 * - `dent` — the surface dents toward the pressed point (3D tilt + inner shade).
 *
 * `shape="pill | circle | icon"` morphs the outline with a spring (label =
 * `[data-label]`, icon = `[data-icon]` children); `morphTo(shape)`.
 *
 * `morph="submit"` — click → `loading` (shrinks to a circle with a spinner,
 * `aria-busy`), then `success` (check) or `error` (shake + cross), and back
 * to `idle` after `reset` ms (1800). Drive it with `state="…"` / `.state`, or
 * call `event.detail.done(ok)` from a `usa:submit` listener.
 *
 * Attributes: `deform`, `shape`, `morph`, `state`, `reset`, `haptic`,
 * `disabled`. Events: `usa:submit`, `usa:state`. Reduced motion: no
 * deformation; shape and state changes are instant; status still announced.
 */
interface UsaButtonElement extends UsaElement {
    readonly target: HTMLElement;
    shape: ButtonShape;
    state: ButtonState;
    morphTo(shape: ButtonShape): Promise<void>;
}
declare function defineButton(tag?: string): CustomElementConstructor | undefined;

type Pt = [number, number];
type Quad = [Pt, Pt, Pt, Pt];
/**
 * Morphable icons: every icon is three quads (four points each) on a 24×24
 * grid, so any icon can morph into any other by interpolating points.
 */
declare const MORPH_ICONS: Record<string, [Quad, Quad, Quad]>;
/** SVG path data for an icon, or for the interpolation `t` (0–1) between two. */
declare function morphPath(from: string, to?: string, t?: number): string;
/**
 * `<usa-icon-morph>` — an icon that morphs between shapes with a spring:
 * play ↔ pause, menu ↔ close, plus ↔ minus, check, arrow-right…
 *
 * Attributes: `icons` (comma list, cycled; default `play,pause`), `index`
 * (current, 0), `size` (px, 24), `toggle` (makes it a button that cycles
 * on click / Enter / Space), `labels` (comma list of accessible names per
 * icon, e.g. `Play,Pause`), `preset` (spring, `wobbly`). Methods:
 * `next()`, `show(nameOrIndex)`. Events: `usa:change` (`{ index, icon }`).
 * Inside a `<usa-button>` or `<button>` it is decorative. Reduced motion:
 * the icon switches instantly.
 */
interface UsaIconMorphElement extends UsaElement {
    index: number;
    readonly icon: string;
    next(): void;
    show(icon: string | number): void;
}
declare function defineIconMorph(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-like>` — a like / favourite toggle: the heart pops with a spring and
 * bursts into particles when liked. `role="button"` + `aria-pressed`.
 *
 * Attributes: `liked`, `count` (shown next to the heart, updated ±1),
 * `label` (accessible name, default "Like"), `color`, `size` (px, 24),
 * `haptic`, `disabled`. Events: `change`, `usa:change` (`{ liked, count }`).
 * Reduced motion: colour change only.
 */
interface UsaLikeElement extends UsaElement {
    liked: boolean;
    count: number | null;
    toggle(force?: boolean): void;
}
declare function defineLike(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-hold>` — hold-to-confirm: press and hold (pointer, Space or Enter)
 * while a progress ring fills; releasing early rewinds it. Good for
 * destructive actions.
 *
 * Attributes: `duration` (ms, 1200), `label` (accessible name), `color`,
 * `disabled`. CSS variable `--usa-hold` (0–1). Events: `usa:progress`,
 * `usa:confirm`, `usa:cancel`. Reduced motion: same timing, the ring fills
 * without the scale pulse.
 */
interface UsaHoldElement extends UsaElement {
    readonly progress: number;
    cancel(): void;
}
declare function defineHold(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-double-tap>` — detects a double tap / double click on its content
 * (photos, posts) and pops a heart (or `icon`) at the tap point.
 *
 * Attributes: `icon` (text / emoji, default ♥), `color`, `delay` (max ms
 * between taps, 300), `haptic`, `disabled`. Events: `usa:double-tap`
 * (`{ x, y }`, element-relative). Keyboard users: press `L` while focused.
 * Reduced motion: the icon fades in and out without scaling or particles.
 */
interface UsaDoubleTapElement extends UsaElement {
    pop(x?: number, y?: number): void;
}
declare function defineDoubleTap(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-checkbox>` — an animated, form-associated checkbox: the box springs
 * and the check mark draws itself. `role="checkbox"` + `aria-checked`
 * (`mixed` with `indeterminate`).
 *
 * Attributes: `checked`, `indeterminate`, `disabled`, `name`, `value`
 * (`on`), `label`, `shape` (`square` default, `circle`). Events: `change`,
 * `usa:change` (`{ checked }`). Reduced motion: no spring or drawing.
 */
interface UsaCheckboxElement extends UsaElement {
    checked: boolean;
    indeterminate: boolean;
    toggle(force?: boolean): void;
}
declare function defineCheckbox(tag?: string): CustomElementConstructor | undefined;

interface BurstOptions {
    /** Number of particles (default 12). */
    count?: number;
    /** Colours to pick from (default: accent palette). */
    colors?: string[];
    /** Travel distance in px (default 48). */
    distance?: number;
    /** Particle size in px (default 6). */
    size?: number;
    /** `circle` (default), `square`, `star`, `heart` or any text / emoji. */
    shape?: 'circle' | 'square' | 'star' | 'heart' | string;
    /** Duration in ms (default 600). */
    duration?: number;
}
interface ConfettiOptions {
    /** Origin in client px (default: centre-bottom third of the viewport). */
    x?: number;
    y?: number;
    /** Pieces (default 80). */
    count?: number;
    /** Spread angle in degrees (default 70). */
    spread?: number;
    /** Launch speed multiplier (default 1). */
    velocity?: number;
    colors?: string[];
    /** Duration in ms (default 1600). */
    duration?: number;
}
/** `navigator.vibrate()` where supported (Android Chrome, some WebViews). Returns whether it ran. */
declare function haptic(pattern?: number | number[]): boolean;

/**
 * motionary/components/click — click & tap effects (v2.5).
 * `<usa-click>` (ripple, burst, confetti, squish, press-spring, shake),
 * `<usa-button>` (button click deformation: squash, wobble, gooey, dent;
 * shape morph; submit → loading → success), `<usa-icon-morph>`,
 * `<usa-like>`, `<usa-hold>`, `<usa-double-tap>`, `<usa-checkbox>`, plus
 * `haptic()`. 6.0: `burst()`, `confetti()` and `shake()` were removed — play
 * the registered effects instead: `playEffect(el, 'burst' | 'confetti' | 'shake')`.
 */

/** Register every component of this category under its default tag. */
declare function defineClickComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-click': UsaClickElement;
        'usa-button': UsaButtonElement;
        'usa-icon-morph': UsaIconMorphElement;
        'usa-like': UsaLikeElement;
        'usa-hold': UsaHoldElement;
        'usa-double-tap': UsaDoubleTapElement;
        'usa-checkbox': UsaCheckboxElement;
    }
}

/**
 * `<usa-tabs>` — accessible tabs with a sliding (spring) indicator.
 * Tabs: `[data-tab]` children (buttons); panels: `[data-panel]` children, in
 * the same order. Arrow keys / Home / End move between tabs (roving tabindex).
 *
 * Attributes: `selected` (index, 0), `indicator` (`line` default, `pill`),
 * `variant`. Events: `usa:change` (`{ index }`). Panels fade/slide in;
 * reduced motion: the indicator jumps and panels switch instantly.
 */
interface UsaTabsElement extends UsaElement {
    selected: number;
    select(i: number, focus?: boolean): void;
}
declare function defineTabs(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-drawer>` — a side panel that slides in with a spring and can be
 * dragged / swiped closed. Modal: backdrop, Esc, focus returns on close.
 * Attributes: `open`, `side` (`left` default, `right`, `top`, `bottom`),
 * `label`, `variant`. Events: `usa:open`, `usa:close`. `[data-close]` closes.
 * Reduced motion: opens and closes instantly.
 */
interface UsaDrawerElement extends UsaElement {
    open: boolean;
    show(): void;
    close(): void;
}
/**
 * `<usa-bottom-sheet>` — a draggable bottom sheet with snap points
 * (`snap="0.3,0.6,0.92"`, fractions of the viewport height; default
 * `0.5,0.92`; `start` = index of the snap it opens at, default 0), inertia and drag-down-to-dismiss. `[data-handle]` (or the
 * built-in grabber) drags it. Attributes: `open`, `snap`, `start` (initial
 * snap index), `label`, `variant`. Events: `usa:open`, `usa:close`, `usa:snap`.
 */
interface UsaBottomSheetElement extends UsaDrawerElement {
}
declare function defineDrawer(tag?: string): CustomElementConstructor | undefined;
declare function defineBottomSheet(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-pull-refresh>` — pull-to-refresh for a scroll container (itself):
 * pull down at the top (touch / pointer) and a spinner stretches in; past
 * `threshold` (px, 70) releasing fires `usa:refresh` — call
 * `event.detail.done()` (or return a promise to `onrefresh`) to finish.
 * Also exposes `refresh()` for a keyboard / button path.
 * Attributes: `threshold`, `disabled`, `label` (status text, "Refreshing").
 * Reduced motion: no stretch; the spinner simply appears while refreshing.
 */
interface UsaPullRefreshElement extends UsaElement {
    readonly refreshing: boolean;
    refresh(): Promise<void>;
}
declare function definePullRefresh(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-fab>` — floating action button with a speed dial. The first element
 * child is the main button; the others are actions that fan out with a
 * staggered spring when it opens (`direction="up"` default, `down`, `left`,
 * `right`, `radial`). Esc / outside click closes; `aria-expanded` on the
 * main button; actions are hidden from AT while closed.
 * Attributes: `open`, `direction`, `position` (`bottom-right` default, `bottom-left`,
 * `inline`), `gap` (px, 56), `variant`. Events: `usa:toggle` (`{ open }`).
 * Reduced motion: actions appear without travel.
 */
interface UsaFabElement extends UsaElement {
    open: boolean;
    toggle(force?: boolean): void;
}
declare function defineFab(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-navbar>` — an app bar that hides while you scroll down and returns
 * as soon as you scroll up (or reach the top); `shrink` makes it compact
 * once scrolled. Focus inside always reveals it.
 * Attributes: `threshold` (px of scroll before hiding, 64), `shrink`,
 * `target` (selector of a scroll container instead of the page), `variant`.
 * State attributes: `data-hidden`, `data-scrolled`. Events: `usa:hide`, `usa:show`.
 * Reduced motion: hides/shows without sliding (instant).
 */
interface UsaNavbarElement extends UsaElement {
    readonly hiddenByScroll: boolean;
    show(): void;
}
declare function defineNavbar(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-slider>` — a form-associated range slider (`role="slider"`). The
 * thumb follows with a spring, grows while dragged and shows a value bubble.
 * Keyboard: arrows (step), PageUp/PageDown (10 steps), Home/End.
 * Attributes: `value`, `min` (0), `max` (100), `step` (1), `name`, `label`,
 * `bubble` (show the value while dragging), `disabled`, `variant`.
 * Events: `input` + `usa:input` while moving, `change` + `usa:change` on release.
 * Reduced motion: the thumb jumps (no spring).
 */
interface UsaSliderElement extends UsaElement {
    value: number;
}
declare function defineSlider(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-rating>` — star rating with hover preview and a springy pop when a
 * value is chosen. `role="slider"` (arrow keys, Home/End, number keys).
 * Attributes: `value` (0), `max` (5), `icon` (★), `readonly`, `label`
 * ("Rating"), `name` (form value), `variant`. Events: `change`, `usa:change` (`{ value }`).
 * Reduced motion: no pop.
 */
interface UsaRatingElement extends UsaElement {
    value: number;
}
declare function defineRating(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-tooltip text="…">` — a tooltip for the element it wraps, shown on
 * hover (after `delay` ms, 300) and on keyboard focus, hidden on Esc / blur.
 * It springs in from its placement side and flips to stay on screen; the
 * trigger gets `aria-describedby`.
 * Attributes: `text`, `placement` (`top` default, `bottom`, `left`, `right`),
 * `delay`, `variant`. Reduced motion: fades only.
 */
interface UsaTooltipElement extends UsaElement {
    show(): void;
    hide(): void;
}
declare function defineTooltip(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-popover>` — a click-to-open popover: the first element child is the
 * trigger, `[data-popover]` is the content. Springs open from the trigger,
 * flips to stay on screen; Esc or an outside click closes and focus returns
 * to the trigger. `aria-expanded` / `aria-controls` on the trigger.
 * Attributes: `open`, `placement` (`bottom` default), `variant`. Events:
 * `usa:open`, `usa:close`. Reduced motion: fades only.
 */
interface UsaPopoverElement extends UsaElement {
    open: boolean;
    toggle(force?: boolean): void;
}
declare function definePopover(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-badge>` — a count / dot badge on whatever it wraps; bumps with a
 * spring whenever the value changes and pulses with `pulse`.
 * Attributes: `value` (number or text; 0 / empty hides it unless
 * `show-zero`), `max` (99 → "99+"), `dot`, `pulse`, `label` (accessible
 * text, default "{n} new"), `variant`. Reduced motion: no bump or pulse.
 */
interface UsaBadgeElement extends UsaElement {
    value: string;
}
declare function defineBadge(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-avatar-stack>` — overlapping avatars (its children: `<img>` or any
 * element) that spread apart with a spring on hover / focus; extra ones
 * collapse into a "+N" chip.
 * Attributes: `max` (visible avatars, 5), `size` (px, 36), `overlap` (0–1,
 * 0.35), `label` (group name), `variant`. Reduced motion: no spreading.
 */
interface UsaAvatarStackElement extends UsaElement {
}
declare function defineAvatarStack(tag?: string): CustomElementConstructor | undefined;

/**
 * Style variants (v2.6): `variant="minimal | neon | glass | brutalist |
 * fluent | material"` on any `<usa-*>` element — or on any ancestor as
 * `data-usa-variant`, or page-wide with `setVariant()` — sets the shared
 * design tokens every component reads:
 *
 * `--usa-accent`, `--usa-accent-text`, `--usa-surface`, `--usa-text`,
 * `--usa-radius`, `--usa-border`, `--usa-shadow`, `--usa-blur`, `--usa-font`.
 *
 * (`<usa-spinner>`, `<usa-check>` and `<usa-dialog>` already use `variant`
 * for their kind; the token names never clash with those values except
 * `fluent`, which means the same thing there.)
 */
declare const VARIANTS: readonly ["minimal", "neon", "glass", "brutalist", "fluent", "material"];
type Variant = (typeof VARIANTS)[number];
/** Inject the variant token sheet (done automatically by every `ui` component). */
declare function adoptVariants(): void;
/** Apply a variant to the whole page (or `root`); `null` removes it. */
declare function setVariant(variant: Variant | null, root?: Element | null): void;

type Placement = 'top' | 'bottom' | 'left' | 'right';

/**
 * motionary/components/ui — animated UI components + style variants (v2.6).
 * `<usa-tabs>`, `<usa-drawer>`, `<usa-bottom-sheet>`, `<usa-pull-refresh>`,
 * `<usa-fab>`, `<usa-navbar>`, `<usa-slider>`, `<usa-rating>`,
 * `<usa-tooltip>`, `<usa-popover>`, `<usa-badge>`, `<usa-avatar-stack>`,
 * and `variant="minimal | neon | glass | brutalist | fluent | material"`
 * design tokens (`setVariant()`, `VARIANTS`).
 */

/** Register every component of this category under its default tag. */
declare function defineUiComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-tabs': UsaTabsElement;
        'usa-drawer': UsaDrawerElement;
        'usa-bottom-sheet': UsaBottomSheetElement;
        'usa-pull-refresh': UsaPullRefreshElement;
        'usa-fab': UsaFabElement;
        'usa-navbar': UsaNavbarElement;
        'usa-slider': UsaSliderElement;
        'usa-rating': UsaRatingElement;
        'usa-tooltip': UsaTooltipElement;
        'usa-popover': UsaPopoverElement;
        'usa-badge': UsaBadgeElement;
        'usa-avatar-stack': UsaAvatarStackElement;
    }
}

declare const CURSOR_MODES: readonly ["dot", "magnetic", "glow"];
type CursorMode = (typeof CURSOR_MODES)[number];
/**
 * `<usa-cursor mode="dot | magnetic | glow">` — a custom cursor for
 * the page (place it once, e.g. at the end of `<body>`).
 * - `dot` — a ring that follows with spring lag around the real pointer;
 * (6.0: `mode="trail"` was removed — use the registered `comet-trail` effect;
 * unknown modes render as `dot`.)
 * - `magnetic` — the ring snaps onto and wraps hovered targets (`a`,
 *   `button`, `[data-cursor]`);
 * - `glow` — a large soft light following the pointer (great on dark UIs).
 * Attributes: `mode`, `color`, `size` (px, 28), `hide-native` (hide the
 * system cursor), `targets` (selector, magnetic). Only for fine pointers
 * (mouse / pen); never on touch. Reduced motion: not rendered.
 */
interface UsaCursorElement extends UsaElement {
    readonly active: boolean;
}
declare function defineCursor(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-fullpage>` — full-screen sections (its element children) that snap
 * one at a time (CSS scroll snap), with keyboard paging (PageUp/PageDown,
 * arrows, Home/End), optional dot navigation and the current section in
 * `aria-current` + `usa:section`.
 * Attributes: `dots` (show the dot nav), `axis` (`y` default, `x`).
 * Methods: `go(i)`, `next()`, `prev()`. Reduced motion: snapping stays,
 * jumps are instant.
 */
interface UsaFullpageElement extends UsaElement {
    readonly index: number;
    go(i: number): void;
    next(): void;
    prev(): void;
}
declare function defineFullpage(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-loading-bar>` — a slim top loading bar for route changes and fetches
 * (NProgress-style): `start()` trickles towards 90 %, `done()` completes and
 * fades out, `set(0–1)` for real progress. `loadingBar` drives the first bar
 * on the page (created on demand). `role="progressbar"`, `aria-busy`.
 * Attributes: `color`, `height` (px, 3), `position` (`top` default, `bottom`).
 * Reduced motion: no trickle animation — the bar shows / hides.
 */
interface UsaLoadingBarElement extends UsaElement {
    readonly progress: number;
    start(): void;
    set(p: number): void;
    done(): void;
}
declare function defineLoadingBar(tag?: string): CustomElementConstructor | undefined;
/** Drive the page's `<usa-loading-bar>` (created on first use). */
declare const loadingBar: {
    start: () => void;
    set: (p: number) => void;
    done: () => void;
    /** Run `task` with the bar shown; resolves with its result. */
    track<T>(task: Promise<T> | (() => Promise<T>)): Promise<T>;
};

/**
 * `<usa-back-to-top>` — a floating button that appears after `offset` px
 * (300) of scrolling, shows page progress as a ring and springs the page
 * back to the top (then focuses `focus-target`, default `#main` / `body`).
 * Attributes: `offset`, `label` ("Back to top"), `focus-target`, `position`
 * (`bottom-right` default, `bottom-left`). Reduced motion: instant jump.
 */
interface UsaBackToTopElement extends UsaElement {
    readonly visible: boolean;
}
declare function defineBackToTop(tag?: string): CustomElementConstructor | undefined;

declare const AMBIENT_EFFECTS: readonly ["particles", "snow", "stars", "noise", "gradient"];
type AmbientEffect = (typeof AMBIENT_EFFECTS)[number];
/**
 * `<usa-ambient effect="particles | snow | stars | noise | gradient">` — a
 * fixed, page-wide ambient layer behind (or, with `layer="front"`, over)
 * the content, never catching the pointer.
 * - `particles` — slow drifting dots; `snow` — falling flakes with sway;
 *   `stars` — twinkling starfield (canvas, paused in hidden tabs, DPR ≤ 2);
 * - `noise` — animated film grain (CSS, SVG turbulence);
 * - `gradient` — a gradient whose hue shifts with the scroll position.
 * Attributes: `effect`, `density` (0.2–3, 1), `color`, `opacity` (0.6),
 * `layer` (`back` default, `front`), `speed` (1). Reduced motion: one
 * static frame (no falling, twinkling or grain flicker).
 */
interface UsaAmbientElement extends UsaElement {
}
declare function defineAmbient(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-splash>` — an app splash / launch screen: shows its content (logo,
 * spinner) over the page, then leaves with `exit` (`fade` default, `scale`,
 * `slide-up`, `circle`) once the page has loaded (or when you call
 * `done()`), but never sooner than `min` ms (600) — no flash.
 * Attributes: `min`, `exit`, `manual` (wait for `done()`), `label`.
 * Events: `usa:done`. The page underneath is `aria-busy` until then.
 * Reduced motion: fades.
 */
interface UsaSplashElement extends UsaElement {
    done(): Promise<void>;
}
declare function defineSplash(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-auto-skeleton loading>` — automatic skeletons: while `loading` is
 * set, every text block, image, button and input inside is drawn as a
 * shimmering placeholder of its own size — no separate skeleton markup.
 * Remove `loading` (or set `.loading = false`) and the content fades in.
 * `aria-busy` while loading. Opt elements out with `data-no-skeleton`.
 * Reduced motion: static placeholders, no shimmer or fade.
 */
interface UsaAutoSkeletonElement extends UsaElement {
    loading: boolean;
}
declare function defineAutoSkeleton(tag?: string): CustomElementConstructor | undefined;

/** The switch's levels: Off (motion sensitivity `minimal`) + the three intensities. */
type MotionSwitchLevel = 'off' | MotionIntensity;
/**
 * Set the global motion intensity for every `<usa-*>` component:
 * `'low'`, `'normal'` (default), `'high'`. Sets `--usa-motion` and
 * `data-usa-motion` on `<html>`; with `persist` the choice is remembered
 * (localStorage) and restored by `restoreMotionIntensity()`.
 * 5.0: `'off'` was removed — use `setMotionSensitivity('minimal')`.
 */
declare function setMotionIntensity(level: MotionIntensity, persist?: boolean): void;
/** Apply a switch level: `'off'` = motion sensitivity `minimal`, otherwise full motion at that intensity. */
declare function setMotionLevel(level: MotionSwitchLevel, persist?: boolean): void;
/** The current switch level. */
declare function getMotionLevel(): MotionSwitchLevel;
/** Re-apply a persisted level (call early on page load). Returns the active intensity. */
declare function restoreMotionIntensity(): MotionIntensity;
/**
 * `<usa-motion-switch>` — a segmented control letting users choose the
 * app's motion intensity (Off · Low · Normal · High), persisted.
 * `role="radiogroup"`; arrow keys move. Attributes: `labels` (comma list),
 * `label` ("Motion"). Events: `usa:change` (`{ level }`).
 */
interface UsaMotionSwitchElement extends UsaElement {
    value: MotionSwitchLevel;
}
declare function defineMotionSwitch(tag?: string): CustomElementConstructor | undefined;

/**
 * Page & app-wide transitions (v2.7), built on the View Transitions API
 * (Chromium: Chrome, Edge, Electron, WebView2) with graceful fallbacks.
 *
 * - `pageTransition(update, { effect })` — SPA route changes: `fade`,
 *   `slide` (`slide-left` / `slide-right` / `slide-up`), `circle` (reveal
 *   from `x`, `y`), `blinds`, `pixel` (stepped dissolve), `zoom`.
 * - `enableMpaTransitions(effect)` — the same effects for multi-page sites
 *   (`@view-transition { navigation: auto }`); call it on every page.
 * - `themeTransition(apply, { x, y })` — a circle-reveal theme switch.
 *
 * Without View Transitions (Firefox, older Safari) or under reduced motion
 * the update runs immediately (`fade` falls back to a short cross-fade of
 * `fallback` when given).
 */
declare const PAGE_EFFECTS: readonly ["fade", "slide", "slide-left", "slide-right", "slide-up", "circle", "blinds", "pixel", "zoom"];
type PageEffect = (typeof PAGE_EFFECTS)[number];
interface PageTransitionOptions {
    effect?: PageEffect;
    /** Circle origin in client px (default: viewport centre / last pointer). */
    x?: number;
    y?: number;
    /** Duration in ms (default 600). */
    duration?: number;
    /** Element to cross-fade when View Transitions are unavailable. */
    fallback?: Element | null;
}
/** `true` when `document.startViewTransition` exists. */
declare const supportsViewTransitions: () => boolean;
/** Run `update` (sync or async) as an animated page transition. Resolves when it is done. */
declare function pageTransition(update: () => unknown, options?: PageTransitionOptions): Promise<void>;
/** Opt a multi-page site into cross-document view transitions with `effect`. */
declare function enableMpaTransitions(effect?: PageEffect, duration?: number): void;
/**
 * Switch theme with a circle reveal from (`x`, `y`) (default: last pointer).
 * `apply` flips your theme (e.g. toggles a class / `data-theme`).
 */
declare function themeTransition(apply: () => unknown, options?: Omit<PageTransitionOptions, 'effect'>): Promise<void>;

/**
 * `smoothScroll()` — inertial wheel smoothing for the page (or a scroll
 * container): wheel deltas are eased with a lerp each frame. Touch and
 * keyboard scrolling stay native. Returns a function that turns it off.
 * No-op under reduced motion, on touch-only devices and on the server.
 */
interface SmoothScrollOptions {
    /** Scroll container (default: the page). */
    target?: HTMLElement | null;
    /** 0–1, lower = smoother / longer glide (default 0.12). */
    lerp?: number;
    /** Wheel multiplier (default 1). */
    wheelMultiplier?: number;
}
declare function smoothScroll(options?: SmoothScrollOptions): () => void;
/**
 * Scroll to a y position, element or selector with spring timing (or
 * instantly under reduced motion). Resolves when done.
 */
declare function scrollToTarget(to: number | Element | string, options?: {
    offset?: number;
    target?: HTMLElement | null;
    preset?: string;
}): Promise<void>;

/**
 * motionary/components/page — page & app-wide effects (v2.7).
 * Page transitions (`pageTransition()`, `enableMpaTransitions()`,
 * `themeTransition()`), `<usa-cursor>`, `smoothScroll()` / `scrollToTarget()`,
 * `<usa-fullpage>`, `<usa-loading-bar>` + `loadingBar`, `<usa-back-to-top>`,
 * `<usa-ambient>`, `<usa-splash>`, `<usa-auto-skeleton>` and the global motion
 * intensity (`setMotionIntensity()`, `<usa-motion-switch>`).
 */

/** Register every component of this category under its default tag. */
declare function definePageComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-cursor': UsaCursorElement;
        'usa-fullpage': UsaFullpageElement;
        'usa-loading-bar': UsaLoadingBarElement;
        'usa-back-to-top': UsaBackToTopElement;
        'usa-ambient': UsaAmbientElement;
        'usa-splash': UsaSplashElement;
        'usa-auto-skeleton': UsaAutoSkeletonElement;
        'usa-motion-switch': UsaMotionSwitchElement;
    }
}

/**
 * `<usa-timeline>` — declarative choreography. Every descendant with
 * `data-tl="<preset>"` becomes a step, in document order; `data-at`
 * (`'-=200'`, `'<'`, `'label+=100'`, ms), `data-duration` and `data-label`
 * fine-tune it.
 *
 * Attributes: `trigger` (`view` default · `click` · `manual`), `scrub`
 * (progress follows scroll instead of playing), `overlap` (ms each step
 * overlaps the previous, default 0), `duration` (600), `stagger` (ms),
 * `repeat` (replay every time it enters the viewport). 4.1: `scrub` runs on native
 * ScrollTimeline / ViewTimeline when supported (`data-native` is set); `scrub="scroll"`
 * and `smooth` tune it (5.0: `scrub="js"` removed — the JS engine is automatic). Methods: `play()`,
 * `reverse()`, `seek(t)`; property `timeline`. Event `usa:complete`.
 * Reduced motion: steps appear in their final state.
 */
interface UsaTimelineElement extends UsaElement {
    readonly timeline: Timeline | null;
    play(): Promise<void>;
    reverse(): Promise<void>;
    seek(to: number | string): void;
}
declare function defineTimeline(tag?: string): CustomElementConstructor | undefined;

/**
 * motionary/components/timeline — choreography (v3.1).
 * `timeline()` chains, overlaps, labels, seeks, reverses and scroll-scrubs
 * WAAPI animations on one playhead; `<usa-timeline>` builds one from
 * `data-tl` children.
 */

/** Register every component of this category under its default tag. */
declare function defineTimelineComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-timeline': UsaTimelineElement;
    }
}

interface PanState {
    /** Offset from the gesture start (px). */
    dx: number;
    dy: number;
    /** Velocity (px/s). */
    vx: number;
    vy: number;
    first: boolean;
    last: boolean;
    event: Event;
}
type SwipeDirection = 'left' | 'right' | 'up' | 'down';
interface SwipeState {
    direction: SwipeDirection;
    velocity: number;
    dx: number;
    dy: number;
}
interface PinchState {
    scale: number; /** Midpoint of the two pointers (client px). */
    x: number;
    y: number;
    first: boolean;
    last: boolean;
}
interface PressState {
    x: number;
    y: number;
}
interface GestureHandlers {
    onPan?: (s: PanState) => void;
    onSwipe?: (s: SwipeState) => void;
    onPinch?: (s: PinchState) => void;
    onLongPress?: (s: PressState) => void;
    onTap?: (s: PressState) => void;
    onDoubleTap?: (s: PressState) => void;
}
interface GestureOptions {
    /** Restrict panning to an axis. */
    axis?: 'x' | 'y';
    /** Movement (px) before a pan starts (default 4). */
    threshold?: number;
    /** Minimum distance (px, default 40) and speed (px/s, default 300) for a swipe. */
    swipeDistance?: number;
    swipeVelocity?: number;
    /** Long-press delay (ms, default 500). */
    longPress?: number;
    /** Ctrl/⌘ + wheel (trackpad pinch) counts as pinch (default true). */
    wheelPinch?: boolean;
}
/** The swipe a pointer release represents, or `null` (pure). */
declare function swipeDirection(dx: number, dy: number, vx: number, vy: number, o?: {
    distance?: number;
    velocity?: number;
    axis?: 'x' | 'y';
}): SwipeState | null;
/** Scale between two pointer distances, clamped to [min, max] (pure). */
declare function pinchScale(startDistance: number, distance: number, base?: number, min?: number, max?: number): number;
/**
 * One recognizer for pan, swipe, pinch (two pointers or Ctrl + wheel),
 * long-press, tap and double-tap, with velocities ready to hand to a spring
 * (`createSpring().set(target, velocity)`). Works with mouse, touch and pen
 * through Pointer Events. Returns a cleanup function.
 *
 * @example
 * const x = createSpring({ onUpdate: (v) => (card.style.translate = `${v}px`) });
 * gesture(card, {
 *   onPan: ({ dx, last, vx }) => (last ? x.set(0, vx) : x.jump(dx)),
 *   onSwipe: ({ direction }) => dismiss(direction),
 * }, { axis: 'x' });
 */
declare function gesture(el: HTMLElement, h: GestureHandlers, o?: GestureOptions): () => void;

/**
 * `<usa-swipeable>` — swipe-to-dismiss / swipe actions. The content follows
 * the finger (rubber-banded past `distance`), flies out on a swipe or a drag
 * past `distance`, otherwise springs home with the release velocity.
 *
 * Attributes: `axis` (`x` default · `y`), `distance` (px, 120), `preset`
 * (spring), `dismiss` (remove the element after flying out), `disabled`.
 * Keyboard: Delete/Backspace dismisses, ←/→ swipe. Events `usa:swipe`
 * (`{ direction }`, cancelable), `usa:dismiss`. Methods `swipe(dir)`, `reset()`.
 * Reduced motion: no follow / fly-out animation, events still fire.
 */
interface UsaSwipeableElement extends UsaElement {
    swipe(direction: SwipeDirection): void;
    reset(): void;
    readonly offset: number;
}
declare function defineSwipeable(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-pinch-zoom>` — pinch (two fingers or Ctrl/⌘ + wheel / trackpad
 * pinch) to zoom its content, pan while zoomed, double-tap to toggle zoom;
 * scale and position spring back inside the bounds on release.
 *
 * Attributes: `min` (1), `max` (4), `double-tap` (zoom level, 2), `preset`.
 * Keyboard: `+` / `-` / `0`. Property `scale`, method `zoomTo(scale)`.
 * Event `usa:zoom` (`{ scale }`). Reduced motion: zoom changes instantly.
 */
interface UsaPinchZoomElement extends UsaElement {
    readonly scale: number;
    zoomTo(scale: number): void;
}
declare function definePinchZoom(tag?: string): CustomElementConstructor | undefined;

/**
 * motionary/components/gesture — unified gestures (v3.2).
 * `gesture()` recognises pan, swipe, pinch, long-press, tap and double-tap
 * with release velocities for springs; `<usa-swipeable>` (swipe-to-dismiss)
 * and `<usa-pinch-zoom>` are built on it.
 */

/** Register every component of this category under its default tag. */
declare function defineGestureComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-swipeable': UsaSwipeableElement;
        'usa-pinch-zoom': UsaPinchZoomElement;
    }
}

/**
 * `<usa-draw>` — line drawing: every stroke of the SVG inside draws itself.
 * Attributes: `trigger` (`view` default · `hover` · `click` · `scrub`),
 * `duration` (1600), `stagger` (0–0.9 share of the timeline, 0.2), `fill`
 * (fade the fill in after drawing), `repeat`. Method `play()`, property
 * `progress`, event `usa:complete`. Reduced motion: drawn immediately.
 */
interface UsaDrawElement extends UsaElement {
    play(): void;
    progress: number;
}
declare function defineDraw(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-morph>` — morphs an SVG path through a list of shapes.
 * Put a `<svg><path></path></svg>` inside (one is created otherwise) and set
 * `paths="M… | M… | M…"` (same command structure morphs smoothly, others
 * switch at the midpoint). Attributes: `trigger` (`click` default · `hover`
 * · `auto` · `view`), `interval` (ms for auto, 2000), `duration` (600).
 * Property `index`, method `next()`, event `usa:change`.
 * Reduced motion: shapes switch without animating; `auto` does not cycle.
 */
interface UsaMorphElement extends UsaElement {
    readonly index: number;
    next(): Promise<void>;
}
declare function defineMorph(tag?: string): CustomElementConstructor | undefined;

/** Clip-path start / end frames for each reveal shape. */
declare const MASK_SHAPES: Record<string, [string, string]>;
/**
 * `<usa-mask-reveal>` — reveals its content through a growing mask shape.
 * Attributes: `shape` (`circle` default · `diamond` · `wipe` · `wipe-up` ·
 * `iris` · `star`), `duration` (900), `delay`, `trigger` (`view` · `hover`
 * · `click`), `repeat`, `at` (`x% y%` origin for circle). Event
 * `usa:complete`. Reduced motion: content is shown without the mask.
 */
interface UsaMaskRevealElement extends UsaElement {
    reveal(): Promise<void>;
}
declare function defineMaskReveal(tag?: string): CustomElementConstructor | undefined;

type Icon = {
    d: string;
    frames: Keyframe[];
    duration: number;
    origin?: string;
};
/** Built-in animated icons (24×24 strokes) and the motion each one plays. */
declare const ANIM_ICONS: Record<string, Icon>;
/**
 * `<usa-anim-icon name="bell">` — an animated stroke icon that plays its
 * motion on `trigger` (`hover` default · `click` · `view` · `loop`).
 * Attributes: `name` (see `ANIM_ICONS`), `size` (24), `label` (accessible
 * name; decorative when absent). Method `play()`. Reduced motion: static.
 */
interface UsaAnimIconElement extends UsaElement {
    play(): void;
}
declare function defineAnimIcon(tag?: string): CustomElementConstructor | undefined;

/** `true` when two path strings share the same commands (so their numbers can be interpolated). */
declare function pathsCompatible(a: string, b: string): boolean;
/**
 * Path data between `a` and `b` at `t` (0–1). Paths with the same command
 * structure morph number-by-number; others switch at the midpoint.
 */
declare function interpolatePath(a: string, b: string, t: number): string;
interface MorphOptions {
    duration?: number;
    easing?: (t: number) => number;
}
/** Animate a `<path>`'s `d` to `to`. Resolves when done; instant under reduced motion. */
declare function morphTo(path: SVGPathElement | Element, to: string, o?: MorphOptions): Promise<void>;
/**
 * Prepare every stroke in `root` for line drawing (normalised `pathLength=1`,
 * so no `getTotalLength()` is needed) and return a function that sets
 * progress 0–1, optionally staggered between shapes.
 */
declare function drawLines(root: Element, o?: {
    stagger?: number;
}): (progress: number) => void;

/**
 * motionary/components/svg — SVG animation (v3.3).
 * `<usa-draw>` (line drawing), `<usa-morph>` (path morph), `<usa-mask-reveal>`
 * (mask / clip-path reveals) and `<usa-anim-icon>` (animated icons), plus
 * `interpolatePath()`, `morphTo()`, `drawLines()`.
 */

/** Register every component of this category under its default tag. */
declare function defineSvgComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-draw': UsaDrawElement;
        'usa-morph': UsaMorphElement;
        'usa-mask-reveal': UsaMaskRevealElement;
        'usa-anim-icon': UsaAnimIconElement;
    }
}

/**
 * Shared shell for the WebGL elements: a canvas over (or behind) the
 * content that renders only while visible and the tab is shown, a DPR cap
 * of 2, and a graceful fallback (`data-fallback`) when WebGL, the shader
 * or the image (CORS) is unavailable — the original content / CSS stays.
 */
interface UsaGLElement extends UsaElement {
    /** `true` once WebGL rendering is active (otherwise the CSS fallback shows). */
    readonly active: boolean;
}
/**
 * `<usa-shader>` — GPU shader background behind its content. `preset`
 * (`gradient` · `plasma` · `waves` · `aurora`) or your own fragment shader in
 * `<script type="x-shader/x-fragment">` (uniforms `u_time`, `u_resolution`,
 * `u_mouse`, `v_uv`); `speed`. Without WebGL: the element's CSS background.
 */
declare function defineShader(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-distort>` — hover distortion + RGB split on the `<img>` inside,
 * following the pointer. Without WebGL / CORS: a gentle CSS zoom.
 */
declare function defineDistort(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-liquid>` — liquid image: clicks / taps send ripples through the
 * `<img>` inside, hover adds a gentle wobble; `strength`. Fallback: plain image.
 */
declare function defineLiquid(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-post-fx effects="vignette grain crt" intensity="0.6">` — GPU
 * post-processing over the `<img>` inside (4.8): `vignette` · `grain` ·
 * `chromatic` · `scanlines` · `crt` · `bloom` · `pixelate` · `duotone` ·
 * `glitch`, chained in order. `quality="high"` disables adaptive quality.
 * Fallback: the image with an approximate CSS filter.
 */
declare function definePostFx(tag?: string): CustomElementConstructor | undefined;

/**
 * 4.8 — WebGL preset library on `glQuad()`: particle presets (`snow`,
 * `fireflies`, `stars`, `bokeh`, `rain` — usable as `<usa-shader preset>`),
 * chainable post-processing passes for images (`<usa-post-fx>`), one CSS
 * fallback per preset, and an adaptive quality governor (fps + battery).
 */
declare const PARTICLE_PRESETS: readonly ["snow", "fireflies", "stars", "bokeh", "rain"];
type ParticlePreset = (typeof PARTICLE_PRESETS)[number];
/** Post-processing passes: `vec3 fx(vec3 c, vec2 uv)` bodies, applied in order. `u_intensity` 0–1. */
declare const POST_EFFECTS: Record<string, string>;
type PostEffect = keyof typeof POST_EFFECTS;
/** One fragment shader running the passes in order over `u_tex` (pixel-sampling passes read the source). */
declare function postFxShader(effects: string[]): string;
/** The unified CSS fallback (no WebGL / reduced data): a still background or image filter per preset. */
declare const GL_FALLBACKS: Record<string, string>;
/** CSS fallback for a shader preset / post effect list. */
declare function glFallbackCss(preset: string, post?: boolean): string;
interface GLGovernorOptions {
    /** Below this fps quality drops (default 40). */
    minFps?: number;
    /** Frame-rate cap on battery saver / low battery (default 30). */
    saverFps?: number;
}
interface GLGovernor {
    /** Feed a frame time (ms); returns `true` when this frame should render. */
    tick(t: number): boolean;
    /** Current resolution scale (1 → 0.5 → 0.35). */
    readonly scale: number;
    /** Measured fps over the last second. */
    readonly fps: number;
    /** Battery saver / low battery: renders at `saverFps` and scale ≤ 0.6. */
    saver: boolean;
    /** Called when `scale` changes (resize the canvas). */
    onScale?: (scale: number) => void;
}
/**
 * Adaptive quality for GL loops: measures fps, steps the resolution scale
 * down (1 → 0.5 → 0.35) after two slow seconds and back up after five good
 * ones, and caps the frame rate in battery-saver mode. Pure — feed it times.
 */
declare function glGovernor(options?: GLGovernorOptions): GLGovernor;
/** Watch the Battery Status API (where available) and Save-Data; calls `cb(true)` in saver conditions. Returns a stop function. */
declare function watchPowerSaver(cb: (saver: boolean) => void): () => void;

/** Built-in fragment shaders (bodies; uniforms `u_time`, `u_resolution`, `u_mouse` 0–1, `u_hover` 0–1, `u_tex`, `u_ripples[4]` = x, y, age, strength). */
declare const SHADERS: Record<string, string>;
/** Full fragment source for a preset or custom body (adds the shared header). */
declare function fragmentSource(body: string): string;
declare function supportsWebGL(): boolean;
interface GLQuad {
    /** Draw a frame with these uniform values (`extra`: any other float uniforms by name, 4.8). */
    render(u: {
        time?: number;
        mouse?: [number, number];
        hover?: number;
        ripples?: number[];
        extra?: Record<string, number>;
    }): void;
    /** Resize the drawing buffer to the canvas' CSS size × DPR (≤ 2) × `scale` (4.8 adaptive quality). */
    resize(scale?: number): void;
    /** Upload an image as `u_tex`. */
    texture(img: TexImageSource): void;
    dispose(): void;
}
/** Compile `frag` on a full-canvas quad, or `null` when WebGL / compilation is unavailable. */
declare function glQuad(canvas: HTMLCanvasElement, frag: string): GLQuad | null;

/**
 * motionary/components/webgl — lightweight canvas / WebGL (v3.4).
 * `<usa-shader>` (shader backgrounds), `<usa-distort>` (hover image
 * distortion), `<usa-liquid>` (ripple images) on a tiny single-quad runner
 * (`glQuad()`), with graceful fallbacks when WebGL is unavailable.
 */

/** Register every component of this category under its default tag. */
declare function defineWebglComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-shader': UsaGLElement;
        'usa-distort': UsaGLElement;
        'usa-liquid': UsaGLElement;
        'usa-post-fx': UsaGLElement;
    }
}

/**
 * `<usa-cube>` — a CSS 3D cube whose up-to-six element children are its faces
 * (front, right, back, left, top, bottom). Rotate with drag / swipe, arrow
 * keys, `autoplay` (ms) or `show(face | index)`; spring-driven.
 * Attributes: `size` (px, 200), `autoplay`, `perspective` (900).
 * `usa:change` (`{ index, face }`). Reduced motion: instant face switch.
 */
interface UsaCubeElement extends UsaElement {
    readonly index: number;
    show(face: number | string): void;
    next(): void;
    prev(): void;
}
declare function defineCube(tag?: string): CustomElementConstructor | undefined;

/**
 * `<usa-depth>` — depth parallax: children with `data-depth` (-1…1, 0 = the
 * screen plane) move and scale by depth as the pointer moves, the device
 * tilts (`orientation`) or the page scrolls (`scroll`).
 * Attributes: `source` (`pointer` default · `orientation` · `scroll` ·
 * space-separated mix), `strength` (px at depth 1, 40), `rotate` (max tilt
 * of the whole scene in deg, 0). `requestPermission()` for iOS motion.
 * Reduced motion: layers stay flat.
 */
interface UsaDepthElement extends UsaElement {
    /** Current -1…1 input. */
    readonly tilt: {
        x: number;
        y: number;
    };
    requestPermission(): Promise<boolean>;
}
declare function defineDepth(tag?: string): CustomElementConstructor | undefined;

interface TiltReading {
    /** Left/right tilt, -1…1. */
    x: number;
    /** Front/back tilt, -1…1. */
    y: number;
}
/** Map a DeviceOrientation reading (beta/gamma degrees) to -1…1 tilt around a resting pose (pure). */
declare function orientationToTilt(beta: number | null, gamma: number | null, range?: number, rest?: number): TiltReading;
/** `true` when DeviceOrientation events exist. */
declare const supportsOrientation: () => boolean;
/**
 * Ask for motion-sensor permission where required (iOS 13+; must run inside
 * a user gesture). Resolves `true` when tilt events can be used.
 */
declare function requestOrientationPermission(): Promise<boolean>;
/**
 * Listen to device tilt (smoothed); falls back to nothing on desktops.
 * Returns a stop function.
 */
declare function deviceTilt(cb: (t: TiltReading) => void, o?: {
    range?: number;
    smooth?: number;
}): () => void;

/**
 * motionary/components/depth — 3D (v3.5).
 * `<usa-cube>` (CSS 3D cube), `<usa-depth>` (layered depth parallax driven by
 * pointer, device orientation or scroll) and `deviceTilt()`. The 3D ring
 * carousel is `<usa-carousel-3d>` in `components/cards`.
 */

/** Register every component of this category under its default tag. */
declare function defineDepthComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-cube': UsaCubeElement;
        'usa-depth': UsaDepthElement;
    }
}

/**
 * `<usa-auto-animate>` — wraps `autoAnimate()`: any change to its children
 * (add, remove, re-order, filter, size) animates. Attributes `duration`
 * (300), `no-scale`. Works for lists and CSS grids alike.
 */
interface UsaAutoAnimateElement extends UsaElement {
    enable(): void;
    disable(): void;
}
declare function defineAutoAnimate(tag?: string): CustomElementConstructor | undefined;
/**
 * `<usa-masonry>` — a masonry (Pinterest-style) grid: children are placed in
 * the shortest column and glide to new spots when the width, the items or
 * their sizes change. Attributes `columns` (fixed count) or `min` (min
 * column width px, 220), `gap` (16). Without JS layout support it is a
 * plain CSS multi-column flow. Reduced motion: no glide.
 */
interface UsaMasonryElement extends UsaElement {
    layout(): void;
}
declare function defineMasonry(tag?: string): CustomElementConstructor | undefined;

type Box = {
    left: number;
    top: number;
    width: number;
    height: number;
};
/** FLIP keyframes from a previous box to the current one (pure). */
declare function flipFrames(from: Box, to: Box, scale?: boolean): Keyframe[];
interface AutoAnimateOptions {
    duration?: number;
    easing?: string;
    /** Also animate size changes (default true). */
    scale?: boolean;
}
/**
 * Auto-animate a container: children that are added fade / scale in, removed
 * ones fade out in place, and moved ones (re-sort, filter, reflow, resize)
 * glide to their new spot — no extra code at the call site. Returns
 * `{ disable, enable, stop }`. Reduced motion: changes apply instantly.
 *
 * @example
 * const ctl = autoAnimate(document.querySelector('ul'));
 * list.append(item); // animates
 */
declare function autoAnimate(parent: HTMLElement, o?: AutoAnimateOptions): {
    enable(): void;
    disable(): void;
    stop(): void;
};
/** Masonry placement: shortest-column-first positions for item heights (pure). */
declare function masonryLayout(heights: number[], columns: number, columnWidth: number, gap: number): {
    x: number;
    y: number;
}[] & {
    height?: number;
};
interface SharedOptions {
    duration?: number;
    easing?: string;
}
/**
 * Shared-element transition between two states of the page: every element
 * with `data-shared="id"` before `update()` flies to the element with the
 * same id afterwards (size and position), the rest cross-fades. Uses the
 * View Transitions API when present (with `view-transition-name` per id),
 * otherwise a FLIP fallback. Reduced motion: just runs `update()`.
 */
declare function sharedTransition(update: () => void | Promise<void>, root?: ParentNode, o?: SharedOptions): Promise<void>;

/**
 * motionary/components/layout — layout animation (v3.6).
 * `autoAnimate()` / `<usa-auto-animate>` (list & grid reflow),
 * `<usa-masonry>`, and `sharedTransition()` for shared-element transitions
 * (View Transitions API with a FLIP fallback).
 */

/** Register every component of this category under its default tag. */
declare function defineLayoutComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-auto-animate': UsaAutoAnimateElement;
        'usa-masonry': UsaMasonryElement;
    }
}

/**
 * `<usa-pack name="ecommerce">` — applies an effect pack (`ecommerce` ·
 * `portfolio` · `dashboard` · `game` · `landing`) to its subtree:
 * descendants opt in with `data-role` (see `PACKS`). Re-applies when
 * `name` changes; undone on disconnect.
 */
interface UsaPackElement extends UsaElement {
    readonly roles: string[];
}
declare function definePack(tag?: string): CustomElementConstructor | undefined;

type Cleanup = () => void;
interface PackContext {
    root: HTMLElement;
    /** Index of the element among those with the same role (for staggering). */
    index: number;
    reduced: boolean;
}
/** Count `el`'s number up from 0 when it enters the view (keeps prefix / suffix / decimals). */
declare function countUp(el: HTMLElement, duration?: number): Cleanup;
/**
 * Fly a copy of `from` (e.g. a product image) into `to` (the cart icon) along
 * an arc, then bump the target. Resolves when it lands. Instant under
 * reduced motion (only the bump's state change, no flight).
 */
declare function flyToCart(from: Element, to: Element, o?: {
    duration?: number;
}): Promise<void>;
/** The five effect packs: `data-role` → primitives. */
declare const PACKS: Record<string, Record<string, string[]>>;
type PackName = keyof typeof PACKS;
/**
 * Apply an effect pack to `root`: every descendant with a `data-role` the
 * pack knows gets its effects (staggered by index). Returns an undo function.
 * Reduced motion: only non-motion behaviour (e.g. the cart event) remains.
 *
 * @example
 * applyPack('ecommerce', document.querySelector('main'));
 * // <article data-role="product">… <button data-role="add-to-cart"> … <a data-role="cart">
 */
declare function applyPack(name: PackName | string, root?: HTMLElement | Document): Cleanup;
/** Primitive names a pack uses (for docs / tooling). */
declare const PACK_PRIMITIVES: string[];

/**
 * motionary/components/packs — effect packs (v3.9).
 * Ready-made motion for e-commerce, portfolio, dashboard, game UI and
 * landing pages: mark elements with `data-role` and apply a pack with
 * `<usa-pack name="…">` or `applyPack(name, root)`. Includes `flyToCart()`
 * and `countUp()`.
 */

/** Register every component of this category under its default tag. */
declare function definePacksComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-pack': UsaPackElement;
    }
}

/**
 * motionary/components/tokens — motion design tokens (4.2).
 *
 * One source of truth for durations, easings and springs: as CSS custom
 * properties (`--usa-duration-fast`, `--usa-easing-emphasized`,
 * `--usa-spring-bouncy-stiffness`…), as W3C Design Tokens JSON, and importable
 * from Figma Tokens (Tokens Studio) or Style Dictionary exports.
 *
 * ```ts
 * import { applyMotionTokens, importMotionTokens, motionToken } from 'motionary/components/tokens';
 * applyMotionTokens(importMotionTokens(await (await fetch('/tokens.json')).json()));
 * el.animate(frames, { duration: motionToken('duration', 'slow'), easing: motionToken('easing', 'emphasized') });
 * ```
 */
interface SpringToken {
    stiffness: number;
    damping: number;
    mass: number;
}
interface MotionTokens {
    /** Durations in ms. */
    duration: Record<string, number>;
    /** CSS easing strings. */
    easing: Record<string, string>;
    /** Spring physics parameters. */
    spring: Record<string, SpringToken>;
}
/** The default motion scale (Material / Fluent-inspired). */
declare const MOTION_TOKENS: MotionTokens;
type MotionTokenGroup = keyof MotionTokens;
type DeepPartialTokens = {
    [K in keyof MotionTokens]?: Partial<MotionTokens[K]>;
};
/** Merge partial tokens over a base (defaults: the built-in scale). */
declare function mergeMotionTokens(partial: DeepPartialTokens, base?: MotionTokens): MotionTokens;
/** The custom-property map: `{ '--usa-duration-fast': '150ms', … }`. */
declare function motionTokensToVars(tokens?: MotionTokens, prefix?: string): Record<string, string>;
/** A stylesheet string: `:root { --usa-duration-fast: 150ms; … }`. */
declare function motionTokensToCss(tokens?: MotionTokens, selector?: string, prefix?: string): string;
/** W3C Design Tokens (DTCG) JSON: `{ motion: { duration: { fast: { $type: 'duration', $value: '150ms' } } } }`. */
declare function motionTokensToJSON(tokens?: MotionTokens): Record<string, unknown>;
/** Parse `150ms`, `0.15s`, `150` → ms. */
declare function parseDuration(v: unknown): number | undefined;
/** Parse `[x1,y1,x2,y2]`, `'cubic-bezier(…)'`, `'0.2, 0, 0, 1'` or a keyword → CSS easing. */
declare function parseEasing(v: unknown): string | undefined;
/**
 * Import tokens from W3C DTCG JSON, Figma Tokens / Tokens Studio
 * (`{ value, type }`) or Style Dictionary (`{ value }`, nested) — anything
 * under a `duration` / `easing` / `spring` group (any depth, e.g.
 * `motion.duration.fast` or `global.animation.easing.out`), or typed leaves
 * (`duration`, `cubicBezier`, `transition`, `spring`). Unknown values are
 * skipped; the result is merged over the defaults.
 */
declare function importMotionTokens(json: unknown, base?: MotionTokens): MotionTokens;
/** The tokens currently applied (via `applyMotionTokens`), or the defaults. */
declare function getMotionTokens(): MotionTokens;
/**
 * Write tokens as CSS custom properties on `root` (default `<html>`) and make
 * them the active set for `motionToken()`. Returns an undo function.
 */
declare function applyMotionTokens(tokens?: DeepPartialTokens | MotionTokens, root?: HTMLElement, prefix?: string): () => void;
/** Look up a token: `motionToken('duration', 'fast')` → `150`; `motionToken('easing', 'emphasized')` → CSS easing. */
declare function motionToken(group: 'duration', name: string): number;
declare function motionToken(group: 'easing', name: string): string;
declare function motionToken(group: 'spring', name: string): SpringToken;
/** `var(--usa-duration-fast, 150ms)` — a CSS reference with the current value as fallback. */
declare function motionVar(group: MotionTokenGroup, name: string, prop?: 'stiffness' | 'damping' | 'mass', prefix?: string): string;
/** Resolve a duration that may be a token name (`'fast'`) or ms. */
declare function resolveDurationToken(v: number | string | undefined, fallback: number): number;
/** Resolve an easing that may be a token name (`'emphasized'`) or CSS. */
declare function resolveEasingToken(v: string | undefined, fallback: string): string;

/** The component categories and their default tags. */
declare const COMPONENT_CATEGORIES: {
    readonly reveal: readonly ["usa-reveal", "usa-stagger", "usa-scroll-progress", "usa-scrolly"];
    readonly text: readonly ["usa-typewriter", "usa-split-text", "usa-scramble", "usa-counter", "usa-shimmer-text", "usa-text-rotate", "usa-wave-text", "usa-glitch", "usa-gradient-text", "usa-handwriting", "usa-scroll-highlight"];
    readonly interaction: readonly ["usa-ripple", "usa-magnetic", "usa-tilt", "usa-spotlight", "usa-press", "usa-toggle"];
    readonly feedback: readonly ["usa-spinner", "usa-skeleton", "usa-progress", "usa-toaster", "usa-check"];
    readonly background: readonly ["usa-aurora", "usa-particles", "usa-grain", "usa-marquee", "usa-acrylic", "usa-grid-glow", "usa-blobs", "usa-water-ripple", "usa-dot-network"];
    readonly transitions: readonly ["usa-dialog", "usa-accordion", "usa-view-switch"];
    readonly physics: readonly ["usa-spring", "usa-draggable", "usa-overscroll"];
    readonly cards: readonly ["usa-card", "usa-card-stack", "usa-sticky-stack", "usa-carousel-3d"];
    readonly click: readonly ["usa-click", "usa-button", "usa-icon-morph", "usa-like", "usa-hold", "usa-double-tap", "usa-checkbox"];
    readonly ui: readonly ["usa-tabs", "usa-drawer", "usa-bottom-sheet", "usa-pull-refresh", "usa-fab", "usa-navbar", "usa-slider", "usa-rating", "usa-tooltip", "usa-popover", "usa-badge", "usa-avatar-stack"];
    readonly page: readonly ["usa-cursor", "usa-fullpage", "usa-loading-bar", "usa-back-to-top", "usa-ambient", "usa-splash", "usa-auto-skeleton", "usa-motion-switch"];
    readonly timeline: readonly ["usa-timeline"];
    readonly gesture: readonly ["usa-swipeable", "usa-pinch-zoom"];
    readonly svg: readonly ["usa-draw", "usa-morph", "usa-mask-reveal", "usa-anim-icon"];
    readonly webgl: readonly ["usa-shader", "usa-distort", "usa-liquid", "usa-post-fx"];
    readonly depth: readonly ["usa-cube", "usa-depth"];
    readonly layout: readonly ["usa-auto-animate", "usa-masonry"];
    readonly packs: readonly ["usa-pack"];
    readonly fx: readonly ["usa-fx"];
};
type ComponentCategory = keyof typeof COMPONENT_CATEGORIES;

interface BaselineFeature {
    id: string;
    required: boolean;
    supported: boolean;
}
/** Required in 5.0: Custom Elements, WAAPI, IntersectionObserver, ResizeObserver, adoptedStyleSheets. Progressive: View Transitions, scroll-driven animations, WebGL. */
declare function baselineReport(): BaselineFeature[];
/** Log (once) which required 5.0 features are missing here. Returns the missing ids. */
declare function warnBaseline(): string[];

/**
 * motionary/components/a11y — accessibility toolkit (4.4).
 *
 * - Motion-sensitivity levels: `setMotionSensitivity('full' | 'gentle' | 'minimal' | 'static')`.
 * - Static alternatives: what every component shows when motion is off, and
 *   `staticAlternative(root)` to freeze any subtree at its final state.
 * - `aria-live` conventions: one shared polite and one assertive region,
 *   `announce(message, { politeness })`.
 * - `auditMotionA11y(root)`: the rules the automated regression tests run
 *   over every `<usa-*>` element — usable in your own tests too.
 *
 * ```ts
 * import { setMotionSensitivity, announce, auditMotionA11y } from 'motionary/components/a11y';
 * setMotionSensitivity('gentle', true);           // no spins / zooms / parallax, remembered
 * announce('3 items added to cart');               // polite live region
 * expect(auditMotionA11y(document.body).errors).toEqual([]);
 * ```
 */

/** What each level allows, for docs and settings UIs. */
declare const MOTION_SENSITIVITY: Record<MotionSensitivity, {
    en: string;
    zh: string;
    allows: string[];
}>;
/** CSS applied at the `static` / `minimal` / `gentle` levels (also stops your own CSS animations under `static`). */
declare const SENSITIVITY_CSS: string;
/**
 * Set the motion-sensitivity level for every `<usa-*>` component and the page:
 * sets `data-usa-sensitivity` on `<html>`, adapts component keyframes, and
 * with `persist` remembers the choice (`restoreMotionSensitivity()`).
 * Dispatches `usa:sensitivity` on `document`.
 */
declare function setMotionSensitivity(level: MotionSensitivity, persist?: boolean): void;
/** Re-apply a persisted level (call early on page load). Returns the active level. */
declare function restoreMotionSensitivity(): MotionSensitivity;
/** `true` when the current level allows a kind of motion (`'rotate'`, `'parallax'`, `'loop'`…). */
declare function motionAllowed(kind: string, level?: MotionSensitivity): boolean;
/** The static alternative of each category: what its elements show without motion. */
declare const STATIC_ALTERNATIVES: Record<ComponentCategory, string>;
/**
 * Freeze a subtree at its static alternative: finishes running animations
 * (`finish()`, so content lands on its final state), marks the root with
 * `data-usa-static` and returns an undo that removes the mark.
 */
declare function staticAlternative(root: Element): () => void;
type Politeness = 'polite' | 'assertive';
/** The ids of the shared live regions. */
declare const LIVE_REGION_IDS: Record<Politeness, string>;
/** The shared live region (created once, visually hidden, `role="status"` / `role="alert"`). */
declare function liveRegion(politeness?: Politeness): HTMLElement | null;
/**
 * Announce a message through the shared live region. Conventions: `polite`
 * for results of the user's own actions (added, saved, copied), `assertive`
 * only for errors that block them. Identical messages within `dedupe` ms
 * (default 500) are dropped; the region is cleared first so repeats are read.
 */
declare function announce(message: string, options?: {
    politeness?: Politeness;
    dedupe?: number;
}): boolean;
interface A11yIssue {
    rule: string;
    level: 'error' | 'warning';
    element: Element;
    message: string;
}
/**
 * Check a subtree against the library's motion-a11y rules:
 * - `aria-hidden-focusable` (error): focusable content inside `aria-hidden`.
 * - `role-name` (error): a widget role without an accessible name.
 * - `range-value` (error): a slider / determinate progressbar without `aria-valuenow`.
 * - `img-alt` (error): an `<img>` without `alt`.
 * - `assertive-live` (warning): `aria-live="assertive"` outside `role="alert"`.
 * - `infinite-no-control` (warning, WCAG 2.2.2): an endless animation on a
 *   page with no way to pause motion (`<usa-motion-switch>` or `[data-usa-pause]`).
 */
declare function auditMotionA11y(root: Element | Document): {
    errors: A11yIssue[];
    warnings: A11yIssue[];
};
/** Every `<usa-*>` tag, for sweeping audits. */
declare const ALL_TAGS: string[];

/**
 * motionary/components/perf — performance toolkit (4.5).
 *
 * - One shared rAF scheduler for every component loop (`onFrame()`, `schedulerStats()`).
 * - Animation budget: `setAnimationBudget(n)` caps concurrent component
 *   animations; extra ones land on their final frame.
 * - `autoDegrade()`: watches frame rate and animation count and steps motion
 *   down (`low`, then a tighter budget) while the device struggles, restoring
 *   it when frames recover.
 * - On-demand CSS: `loadCategoryStyles()` / `onDemandStyles()` — used by
 *   `motionary/components/lite`, the build without inlined CSS.
 */

interface AutoDegradeOptions {
    /** Frame rate below which motion is degraded (default 45). */
    minFps?: number;
    /** Concurrent animations above which motion is degraded (default 40). */
    maxActive?: number;
    /** Sample window in ms (default 1000). */
    sample?: number;
    /** Bad samples in a row before degrading (default 2). */
    patience?: number;
    /** Good samples in a row before restoring (default 3). */
    recovery?: number;
    /** Called on every change. */
    onChange?: (state: DegradeState) => void;
}
interface DegradeState {
    degraded: boolean;
    fps: number;
    active: number;
    reason: '' | 'fps' | 'count';
}
/**
 * Watch frame rate and animation count; while the device struggles, set
 * motion intensity to `low` and cap concurrent animations at `maxActive / 2`,
 * then restore the previous settings once frames recover. Dispatches
 * `usa:degrade` on `document`. Returns a stop function (restores settings).
 */
declare function autoDegrade(options?: AutoDegradeOptions): () => void;
/** The category of a default `<usa-*>` tag. */
declare const categoryOf: (tag: string) => ComponentCategory | undefined;
/**
 * Add `<link rel="stylesheet" href="{base}components/{category}.css">` once.
 * `base` is the URL of the package's `dist/` folder.
 */
declare function loadCategoryStyles(category: ComponentCategory | 'all', base: string): HTMLLinkElement | null;
/**
 * Load each category's CSS the first time one of its elements connects
 * (custom tags fall back to the full stylesheet). Returns an undo.
 */
declare function onDemandStyles(base: string): () => void;
/** Categories whose CSS has been requested so far. */
declare const loadedStyles: () => string[];

/**
 * motionary/components/bridge — native shell bridges (4.7).
 *
 * Keeps the web UI in sync with the host app's system settings when it runs
 * inside **WinUI 3 / WPF (WebView2)**, **.NET MAUI** (WebView / HybridWebView)
 * or **Flutter** (webview_flutter / flutter_inappwebview): the native side
 * sends "reduce motion", light / dark / high-contrast theme and accent color;
 * the page applies them to every `<usa-*>` component.
 *
 * Protocol (JSON, both directions):
 * - native → web `{ "type": "usa:settings", "reducedMotion": true, "theme": "dark", "accent": "#0078d4", "sensitivity": "gentle" }`
 * - web → native `{ "type": "usa:ready", "version": 1 }` on connect, `{ "type": "usa:request-settings" }`
 *
 * Hosts that can only run script call `window.usaNative.apply({...})`.
 * Samples: examples/native/{winui3,maui,flutter}.
 */

type NativeHost = 'webview2' | 'maui' | 'flutter' | 'electron' | 'tauri' | 'browser';
type NativeTheme = 'light' | 'dark' | 'high-contrast';
interface NativeSettings {
    reducedMotion?: boolean;
    theme?: NativeTheme;
    /** CSS color (`#0078d4`, `rgb(…)`). */
    accent?: string;
    /** Optional finer level (4.4). */
    sensitivity?: MotionSensitivity;
}
interface NativeShellOptions {
    /** Element that gets `data-theme` / `color-scheme` / `--usa-accent` (default `<html>`). */
    root?: HTMLElement;
    /** Flutter JavaScriptChannel name (default `UsaBridge`). */
    channel?: string;
    /** Called after settings are applied. */
    onSettings?: (settings: NativeSettings, host: NativeHost) => void;
}
declare const BRIDGE_PROTOCOL_VERSION = 1;
/** Which native shell (if any) hosts this page. */
declare function detectNativeHost(channel?: string): NativeHost;
/** Send a JSON message to the native host (no-op in a plain browser). Returns whether it was sent. */
declare function postToNative(message: Record<string, unknown>, channel?: string): boolean;
/** Validate an incoming message (string or object); unknown fields are dropped. */
declare function parseNativeSettings(data: unknown): NativeSettings | null;
/**
 * Apply native settings: reduce motion → `configureComponents({ reducedMotion: 'reduce' })`
 * (`false` → follow the media query again); theme → `data-theme`, `data-usa-contrast`
 * and `color-scheme`; accent → `--usa-accent`; sensitivity → `motionSensitivity`.
 */
declare function applyNativeSettings(s: NativeSettings, root?: HTMLElement): void;
/**
 * Connect to the native shell: listens for `usa:settings` messages
 * (WebView2 `chrome.webview` messages, `window.postMessage`, or
 * `window.usaNative.apply()`), applies them, then announces `usa:ready` and
 * asks for the current settings. Returns `{ host, disconnect }`.
 */
declare function connectNativeShell(options?: NativeShellOptions): {
    host: NativeHost;
    disconnect: () => void;
};

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
    onCleanup(fn: Cleanup$1): void;
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
    run(el: HTMLElement, options: O, ctx: EffectContext): void | Cleanup$1 | Animation | null | Promise<unknown>;
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
}): Cleanup$1;

/** Every built-in 5.0 effect definition. */
declare const BUILTIN_EFFECTS: EffectDefinition[];

/**
 * motionary/components/fx — unified plugin-style effects (5.0).
 * `registerEffect({ name, kind, run })`, `playEffect(el, name)`,
 * `bindEffect(el, name, { trigger })`, `<usa-fx effect trigger>`. Built-ins:
 * every timeline preset (`enter`), `pulse` · `pop` · `jelly` · `wiggle` ·
 * `heartbeat` · `bounce` · `flash` · `tada` · `shake` (attention),
 * `burst` · `confetti` · `ripple` (click). More packs: `motionary/components/effects`.
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

/**
 * Register every `<usa-*>` component (or only the given categories).
 * Safe to call more than once and on the server (no-op without DOM).
 */
declare function defineComponents(categories?: ComponentCategory[]): void;

export { ALL_TAGS, AMBIENT_EFFECTS, ANIM_ICONS, BRIDGE_PROTOCOL_VERSION, BUILTIN_EFFECTS, BUTTON_DEFORMS, CARD_EFFECTS, CLICK_EFFECTS, COMPONENT_CATEGORIES, CURSOR_MODES, EFFECT_KINDS, EFFECT_TRIGGERS, GL_FALLBACKS, JOINING_SCRIPT, LIVE_REGION_IDS, MASK_SHAPES, MORPH_ICONS, MOTION_SCALE, MOTION_SENSITIVITY, MOTION_SENSITIVITY_LEVELS, MOTION_TOKENS, PACKS, PACK_PRIMITIVES, PAGE_EFFECTS, PARTICLE_PRESETS, POST_EFFECTS, REVEAL_EFFECTS, SENSITIVITY_CSS, SHADERS, SPINNER_VARIANTS, SPRING_EFFECTS, SPRING_PRESETS, STATIC_ALTERNATIVES, TIMELINE_PRESETS, VARIANTS, activeAnimations, adaptKeyframes, adoptVariants, animateWithMotion, animationBudget, announce, applyMotionTokens, applyNativeSettings, applyPack, auditMotionA11y, autoAnimate, autoDegrade, baselineReport, bindEffect, categoryOf, configureComponents, connectNativeShell, countUp, createSpring, defineAccordion, defineAcrylic, defineAmbient, defineAnimIcon, defineAurora, defineAutoAnimate, defineAutoSkeleton, defineAvatarStack, defineBackToTop, defineBackgroundComponents, defineBadge, defineBlobs, defineBottomSheet, defineButton, defineCard, defineCardComponents, defineCardStack, defineCarousel3d, defineCheck, defineCheckbox, defineClick, defineClickComponents, defineComponents, defineCounter, defineCube, defineCursor, defineDepth, defineDepthComponents, defineDialog, defineDistort, defineDotNetwork, defineDoubleTap, defineDraggable, defineDraw, defineDrawer, defineFab, defineFeedbackComponents, defineFullpage, defineFx, defineFxComponents, defineGestureComponents, defineGlitch, defineGradientText, defineGrain, defineGridGlow, defineHandwriting, defineHold, defineIconMorph, defineInteractionComponents, defineLayoutComponents, defineLike, defineLiquid, defineLoadingBar, defineMagnetic, defineMarquee, defineMaskReveal, defineMasonry, defineMorph, defineMotionSwitch, defineNavbar, defineOverscroll, definePack, definePacksComponents, definePageComponents, defineParticles, definePhysicsComponents, definePinchZoom, definePopover, definePostFx, definePress, defineProgress, definePullRefresh, defineRating, defineReveal, defineRevealComponents, defineRipple, defineScramble, defineScrollHighlight, defineScrollProgress, defineScrolly, defineShader, defineShimmerText, defineSkeleton, defineSlider, defineSpinner, defineSplash, defineSplitText, defineSpotlight, defineSpring, defineStagger, defineStickyStack, defineSvgComponents, defineSwipeable, defineTabs, defineTextComponents, defineTextRotate, defineTilt, defineTimeline, defineTimelineComponents, defineToaster, defineToggle, defineTooltip, defineTransitionComponents, defineTypewriter, defineUiComponents, defineViewSwitch, defineWaterRipple, defineWaveText, defineWebglComponents, detectNativeHost, deviceTilt, drawLines, easeOutExpo, enableMpaTransitions, flip, flipFrames, fluentPreset, flyToCart, fragmentSource, gesture, getEffect, getMotionIntensity, getMotionLevel, getMotionSensitivity, getMotionTokens, glFallbackCss, glGovernor, glQuad, graphemes, haptic, hasEffect, importMotionTokens, interpolatePath, linearEasing, listEffects, liveRegion, loadCategoryStyles, loadedStyles, loadingBar, masonryLayout, mergeMotionTokens, morphPath, morphTo, motionAllowed, motionScale, motionToken, motionTokensToCss, motionTokensToJSON, motionTokensToVars, motionVar, onDemandStyles, onFrame, orientationToTilt, pageTransition, parseDuration, parseEasing, parseNativeSettings, pathsCompatible, pinchScale, playEffect, postFxShader, postToNative, prefersReducedMotion, projectInertia, readScrollProgress, registerBuiltinEffects, registerEffect, registerEffects, requestOrientationPermission, resolveDurationToken, resolveEasingToken, resolvePosition, resolveSpring, restoreMotionIntensity, restoreMotionSensitivity, revealKeyframes, rubberBand, schedulerStats, scrambleFrame, scrollToTarget, setAnimationBudget, setMotionIntensity, setMotionLevel, setMotionSensitivity, setVariant, sharedTransition, smoothScroll, snapTo, splitOrder, splitText, splitTimeline, words as splitWords, spring, springEasing, springEffectKeyframes, springSamples, staticAlternative, stepSpring, supportsLinearEasing, supportsNativeScrub, supportsOrientation, supportsViewTransitions, supportsWebGL, swipeDirection, themeTransition, timeline, toast, viewTransition, warnBaseline, watchPowerSaver, withoutDeprecations };
export type { A11yIssue, AmbientEffect, AutoAnimateOptions, AutoDegradeOptions, BaselineFeature, BurstOptions, ButtonDeform, ButtonShape, ButtonState, CardEffect, ClickEffect, ComponentCategory, ComponentsConfig, ConfettiOptions, CursorMode, DeepPartialTokens, DegradeState, DialogVariant, EffectContext, EffectDefinition, EffectKind, EffectTrigger, FlipOptions, FluentPresetOptions, GLGovernor, GLGovernorOptions, GLQuad, GestureHandlers, GestureOptions, MorphOptions, MotionIntensity, MotionSensitivity, MotionSwitchLevel, MotionTokenGroup, MotionTokens, NativeHost, NativeSettings, NativeShellOptions, NativeTheme, PackContext, PackName, PageEffect, PageTransitionOptions, PanState, ParticlePreset, PinchState, Placement, Politeness, PostEffect, PressState, RevealEffect, ScrubHandle, ScrubOptions, SharedOptions, SmoothScrollOptions, SpinnerVariant, SplitBy, SplitFrom, SplitResult, SplitTextOptions, SplitTimelineOptions, SpringConfig, SpringEffect, SpringInput, SpringPreset, SpringToken, SpringValue, SpringValueOptions, SwipeDirection, SwipeState, TiltReading, Timeline, TimelineOptions, TimelinePosition, TimelineStepOptions, ToastHandle, ToastOptions, ToastType, UsaAccordionElement, UsaAcrylicElement, UsaAmbientElement, UsaAnimIconElement, UsaAuroraElement, UsaAutoAnimateElement, UsaAutoSkeletonElement, UsaAvatarStackElement, UsaBackToTopElement, UsaBadgeElement, UsaBlobsElement, UsaBottomSheetElement, UsaButtonElement, UsaCardElement, UsaCardStackElement, UsaCarousel3dElement, UsaCheckElement, UsaCheckboxElement, UsaClickElement, UsaCounterElement, UsaCubeElement, UsaCursorElement, UsaDepthElement, UsaDialogElement, UsaDotNetworkElement, UsaDoubleTapElement, UsaDraggableElement, UsaDrawElement, UsaDrawerElement, UsaElement, UsaFabElement, UsaFullpageElement, UsaFxElement, UsaGLElement, UsaGlitchElement, UsaGradientTextElement, UsaGrainElement, UsaGridGlowElement, UsaHandwritingElement, UsaHoldElement, UsaIconMorphElement, UsaLikeElement, UsaLoadingBarElement, UsaMagneticElement, UsaMarqueeElement, UsaMaskRevealElement, UsaMasonryElement, UsaMorphElement, UsaMotionSwitchElement, UsaNavbarElement, UsaOverscrollElement, UsaPackElement, UsaParticlesElement, UsaPinchZoomElement, UsaPopoverElement, UsaPressElement, UsaProgressElement, UsaPullRefreshElement, UsaRatingElement, UsaRevealElement, UsaRippleElement, UsaScrambleElement, UsaScrollHighlightElement, UsaScrollProgressElement, UsaScrollyElement, UsaShimmerTextElement, UsaSkeletonElement, UsaSliderElement, UsaSpinnerElement, UsaSplashElement, UsaSplitTextElement, UsaSpotlightElement, UsaSpringElement, UsaStaggerElement, UsaStickyStackElement, UsaSwipeableElement, UsaTabsElement, UsaTextRotateElement, UsaTiltElement, UsaTimelineElement, UsaToasterElement, UsaToggleElement, UsaTooltipElement, UsaTypewriterElement, UsaViewSwitchElement, UsaWaterRippleElement, UsaWaveTextElement, Variant, ViewTransitionOptions };
