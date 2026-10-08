/**
 * use-scroll-animate/components — shared base for the `<usa-*>` custom elements.
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
     * to `false` when you load `use-scroll-animate/components.css` yourself.
     */
    injectStyles?: boolean;
    /**
     * `'user'` (default) follows `prefers-reduced-motion`; `'reduce'` always
     * uses the reduced variants (e.g. a kiosk / battery-saver mode);
     * `'no-preference'` ignores the OS setting (only for demos — respect your users).
     */
    reducedMotion?: 'user' | 'reduce' | 'no-preference';
    /**
     * Global motion intensity (v2.7): `'off'` (same as reduced motion),
     * `'low'` (shorter, calmer), `'normal'` (default) or `'high'`. Scales every
     * component animation's duration and sets `--usa-motion` (0 / 0.6 / 1 /
     * 1.25) on `<html>` for your own CSS. See `setMotionIntensity()`.
     */
    motionIntensity?: MotionIntensity;
}
type MotionIntensity = 'off' | 'low' | 'normal' | 'high';
/** Change global component settings (call before `define*()` for `injectStyles`). */
declare function configureComponents(options: ComponentsConfig): void;
/** `true` when animations should be reduced (OS setting or `configureComponents`). */
declare function prefersReducedMotion(): boolean;
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
 * use-scroll-animate/components/text — text effects.
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

export { JOINING_SCRIPT, configureComponents, defineCounter, defineGlitch, defineGradientText, defineHandwriting, defineScramble, defineScrollHighlight, defineShimmerText, defineSplitText, defineTextComponents, defineTextRotate, defineTypewriter, defineWaveText, easeOutExpo, graphemes, prefersReducedMotion, scrambleFrame, splitOrder, splitText, splitTimeline, words as splitWords };
export type { ComponentsConfig, SplitBy, SplitFrom, SplitResult, SplitTextOptions, SplitTimelineOptions, UsaCounterElement, UsaElement, UsaGlitchElement, UsaGradientTextElement, UsaHandwritingElement, UsaScrambleElement, UsaScrollHighlightElement, UsaShimmerTextElement, UsaSplitTextElement, UsaTextRotateElement, UsaTypewriterElement, UsaWaveTextElement };
