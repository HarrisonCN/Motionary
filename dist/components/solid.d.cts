type MotionIntensity = 'low' | 'normal' | 'high';
/**
 * Members shared by every `<usa-*>` element. Attribute helpers, a cleanup
 * bag that is emptied on disconnect, and motion helpers that degrade to the
 * final state without WAAPI or under reduced motion.
 */
interface UsaElement extends HTMLElement {
    /** `true` while reduced motion applies to this element. */
    readonly reduced: boolean;
}

/** Entrance effects shared by `<usa-reveal>` and `<usa-stagger>` (transform / opacity / filter only). */
declare const REVEAL_EFFECTS: readonly ["fade", "fade-up", "fade-down", "fade-left", "fade-right", "zoom-in", "zoom-out", "blur", "blur-up", "flip-up", "flip-left", "rise"];
type RevealEffect = (typeof REVEAL_EFFECTS)[number];

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

/**
 * motionary/components/reveal — entrance & scroll reveal components.
 * `<usa-reveal>`, `<usa-stagger>`, `<usa-scroll-progress>`, `<usa-scrolly>`.
 */

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

/**
 * `<usa-shimmer-text>` — a light sweep across gradient-filled text (CSS
 * only; the element just maps attributes to custom properties).
 *
 * Attributes: `duration` (ms, 2600), `color` (base text colour), `shine`
 * (highlight colour), `angle` (deg, 110). Or style `--usa-shimmer-*`
 * directly. Reduced motion: static gradient text.
 */
type UsaShimmerTextElement = UsaElement;

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

/**
 * `<usa-wave-text>` — letters bob in a travelling wave.
 * Attributes: `amplitude` (em, 0.25), `speed` (s per cycle, 1.6), `stagger`
 * (s between letters, 0.06). Reduced motion: still text.
 */
interface UsaWaveTextElement extends UsaElement {
}
/**
 * `<usa-glitch>` — an RGB-split glitch on its text (`trigger="always"`
 * default, or `hover`). Attributes: `intensity` (px, 3), `trigger`.
 * Reduced motion: no animation (plain text).
 */
interface UsaGlitchElement extends UsaElement {
}
/**
 * `<usa-gradient-text>` — text filled with a flowing multi-colour gradient.
 * Attributes: `colors` (comma list), `speed` (s, 6), `angle` (deg, 90).
 * Reduced motion: a static gradient.
 */
interface UsaGradientTextElement extends UsaElement {
}
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
 * motionary/components/text — text effects.
 * `<usa-typewriter>`, `<usa-split-text>`, `<usa-scramble>`, `<usa-counter>`,
 * `<usa-shimmer-text>`, `<usa-text-rotate>`.
 */

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

/**
 * motionary/components/interaction — micro-interactions.
 * `<usa-ripple>`, `<usa-magnetic>`, `<usa-tilt>`, `<usa-spotlight>`,
 * `<usa-press>`.
 */

declare global {
    interface HTMLElementTagNameMap {
        'usa-ripple': UsaRippleElement;
        'usa-magnetic': UsaMagneticElement;
        'usa-tilt': UsaTiltElement;
        'usa-spotlight': UsaSpotlightElement;
        'usa-press': UsaPressElement;
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

/**
 * motionary/components/feedback — loading & feedback.
 * `<usa-spinner>`, `<usa-skeleton>`, `<usa-progress>`, `<usa-toaster>` +
 * `toast()`, `<usa-check>`.
 */

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

/**
 * `<usa-grid-glow>` — a line grid behind its content that lights up around
 * the pointer. Attributes: `size` (cell px, 32), `color`, `radius` (px, 220).
 * Reduced motion: the grid stays, a soft static glow in the centre.
 */
interface UsaGridGlowElement extends UsaElement {
}
/**
 * `<usa-blobs>` — soft, slowly morphing colour blobs (fluid gradient
 * backdrop). Attributes: `colors` (comma list), `speed` (1), `blur` (px, 60).
 * Reduced motion: still blobs.
 */
interface UsaBlobsElement extends UsaElement {
}
/**
 * `<usa-water-ripple>` — interactive water ripples on a canvas over its
 * content (pointer moves and taps disturb the surface). Low-resolution height
 * map, paused off-screen. Attributes: `damping` (0.96), `strength` (1),
 * `color` (highlight). Reduced motion: nothing is drawn.
 */
interface UsaWaterRippleElement extends UsaElement {
    drop(x: number, y: number, strength?: number): void;
}
/**
 * `<usa-dot-network>` — a grid of dots that swell and link up with lines
 * around the pointer (a living network backdrop). Attributes: `gap` (px,
 * 28), `color`, `radius` (px of influence, 140). Reduced motion: a static
 * dot grid.
 */
interface UsaDotNetworkElement extends UsaElement {
}

/**
 * motionary/components/background — backgrounds & decoration.
 * `<usa-aurora>`, `<usa-particles>`, `<usa-grain>`, `<usa-marquee>`,
 * `<usa-acrylic>`.
 */

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

/**
 * motionary/components/transitions — view & layout transitions.
 * `<usa-dialog>`, `<usa-accordion>`, `<usa-view-switch>`
 * and the `viewTransition()` and `flip()` helpers (4.0: `<usa-flip-list>` → `<usa-auto-animate>`,
 * `connectedAnimation()` → `sharedTransition()`, both in `components/layout`).
 */

declare global {
    interface HTMLElementTagNameMap {
        'usa-dialog': UsaDialogElement;
        'usa-accordion': UsaAccordionElement;
        'usa-view-switch': UsaViewSwitchElement;
    }
}

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

/**
 * motionary/components/physics — spring & bounce physics (v2.3).
 * `<usa-spring>` (bounce-in, pop, drop, jelly, rubber-band), `<usa-draggable>`
 * (spring-back, inertia, snap) and `<usa-overscroll>` (elastic edges), plus
 * the spring core: `spring()`, `springEasing()`, `createSpring()`,
 * `SPRING_PRESETS`, `projectInertia()`, `snapTo()`, `rubberBand()`.
 */

declare global {
    interface HTMLElementTagNameMap {
        'usa-spring': UsaSpringElement;
        'usa-draggable': UsaDraggableElement;
        'usa-overscroll': UsaOverscrollElement;
    }
}

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

/**
 * motionary/components/cards — card effects (v2.4).
 * `<usa-card effect="flip | holo | glass | border-glow | conic-border | lift |
 * spotlight | sheen | parallax-layers | expand">` (combinable),
 * `<usa-card-stack>` (swipeable deck), `<usa-sticky-stack>` (stacking on
 * scroll) and `<usa-carousel-3d>`.
 */

declare global {
    interface HTMLElementTagNameMap {
        'usa-card': UsaCardElement;
        'usa-card-stack': UsaCardStackElement;
        'usa-sticky-stack': UsaStickyStackElement;
        'usa-carousel-3d': UsaCarousel3dElement;
    }
}

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

/**
 * motionary/components/click — click & tap effects (v2.5).
 * `<usa-click>` (ripple, burst, confetti, squish, press-spring, shake),
 * `<usa-button>` (button click deformation: squash, wobble, gooey, dent;
 * shape morph; submit → loading → success), `<usa-icon-morph>`,
 * `<usa-like>`, `<usa-hold>`, `<usa-double-tap>`, `<usa-checkbox>`, plus
 * `haptic()`. 6.0: `burst()`, `confetti()` and `shake()` were removed — play
 * the registered effects instead: `playEffect(el, 'burst' | 'confetti' | 'shake')`.
 */

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

/**
 * `<usa-avatar-stack>` — overlapping avatars (its children: `<img>` or any
 * element) that spread apart with a spring on hover / focus; extra ones
 * collapse into a "+N" chip.
 * Attributes: `max` (visible avatars, 5), `size` (px, 36), `overlap` (0–1,
 * 0.35), `label` (group name), `variant`. Reduced motion: no spreading.
 */
interface UsaAvatarStackElement extends UsaElement {
}

/**
 * motionary/components/ui — animated UI components + style variants (v2.6).
 * `<usa-tabs>`, `<usa-drawer>`, `<usa-bottom-sheet>`, `<usa-pull-refresh>`,
 * `<usa-fab>`, `<usa-navbar>`, `<usa-slider>`,
 * `<usa-popover>`, `<usa-badge>`, `<usa-avatar-stack>`,
 * and `variant="minimal | neon | glass | brutalist | fluent | material"`
 * design tokens (`setVariant()`, `VARIANTS`).
 */

declare global {
    interface HTMLElementTagNameMap {
        'usa-tabs': UsaTabsElement;
        'usa-drawer': UsaDrawerElement;
        'usa-bottom-sheet': UsaBottomSheetElement;
        'usa-pull-refresh': UsaPullRefreshElement;
        'usa-fab': UsaFabElement;
        'usa-navbar': UsaNavbarElement;
        'usa-slider': UsaSliderElement;
        'usa-popover': UsaPopoverElement;
        'usa-badge': UsaBadgeElement;
        'usa-avatar-stack': UsaAvatarStackElement;
    }
}

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

/** The switch's levels: Off (motion sensitivity `minimal`) + the three intensities. */
type MotionSwitchLevel = 'off' | MotionIntensity;
/**
 * `<usa-motion-switch>` — a segmented control letting users choose the
 * app's motion intensity (Off · Low · Normal · High), persisted.
 * `role="radiogroup"`; arrow keys move. Attributes: `labels` (comma list),
 * `label` ("Motion"). Events: `usa:change` (`{ level }`).
 */
interface UsaMotionSwitchElement extends UsaElement {
    value: MotionSwitchLevel;
}

/**
 * motionary/components/page — page & app-wide effects (v2.7).
 * Page transitions (`pageTransition()`, `enableMpaTransitions()`,
 * `themeTransition()`), `<usa-cursor>`, `smoothScroll()` / `scrollToTarget()`,
 * `<usa-fullpage>`, `<usa-loading-bar>` + `loadingBar`, `<usa-back-to-top>`,
 * `<usa-ambient>`, `<usa-splash>`, `<usa-auto-skeleton>` and the global motion
 * intensity (`setMotionIntensity()`, `<usa-motion-switch>`).
 */

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

/**
 * motionary/components/timeline — choreography (v3.1).
 * `timeline()` chains, overlaps, labels, seeks, reverses and scroll-scrubs
 * WAAPI animations on one playhead; `<usa-timeline>` builds one from
 * `data-tl` children.
 */

declare global {
    interface HTMLElementTagNameMap {
        'usa-timeline': UsaTimelineElement;
    }
}

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

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

/**
 * motionary/components/gesture — unified gestures (v3.2).
 * `gesture()` recognises pan, swipe, pinch, long-press, tap and double-tap
 * with release velocities for springs; `<usa-swipeable>` (swipe-to-dismiss)
 * and `<usa-pinch-zoom>` are built on it.
 */

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

/**
 * `<usa-anim-icon name="bell">` — an animated stroke icon that plays its
 * motion on `trigger` (`hover` default · `click` · `view` · `loop`).
 * Attributes: `name` (see `ANIM_ICONS`), `size` (24), `label` (accessible
 * name; decorative when absent). Method `play()`. Reduced motion: static.
 */
interface UsaAnimIconElement extends UsaElement {
    play(): void;
}

/**
 * motionary/components/svg — SVG animation (v3.3).
 * `<usa-draw>` (line drawing), `<usa-morph>` (path morph), `<usa-mask-reveal>`
 * (mask / clip-path reveals) and `<usa-anim-icon>` (animated icons), plus
 * `interpolatePath()`, `morphTo()`, `drawLines()`.
 */

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
 * motionary/components/webgl — lightweight canvas / WebGL (v3.4).
 * `<usa-shader>` (shader backgrounds), `<usa-distort>` (hover image
 * distortion), `<usa-liquid>` (ripple images) on a tiny single-quad runner
 * (`glQuad()`), with graceful fallbacks when WebGL is unavailable.
 */

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

/**
 * motionary/components/depth — 3D (v3.5).
 * `<usa-cube>` (CSS 3D cube), `<usa-depth>` (layered depth parallax driven by
 * pointer, device orientation or scroll) and `deviceTilt()`. The 3D ring
 * carousel is `<usa-carousel-3d>` in `components/cards`.
 */

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

/**
 * motionary/components/layout — layout animation (v3.6).
 * `autoAnimate()` / `<usa-auto-animate>` (list & grid reflow),
 * `<usa-masonry>`, and `sharedTransition()` for shared-element transitions
 * (View Transitions API with a FLIP fallback).
 */

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

/**
 * motionary/components/packs — effect packs (v3.9).
 * Ready-made motion for e-commerce, portfolio, dashboard, game UI and
 * landing pages: mark elements with `data-role` and apply a pack with
 * `<usa-pack name="…">` or `applyPack(name, root)`. Includes `flyToCart()`
 * and `countUp()`.
 */

declare global {
    interface HTMLElementTagNameMap {
        'usa-pack': UsaPackElement;
    }
}

/** The component categories and their default tags. */
declare const COMPONENT_CATEGORIES: {
    readonly reveal: readonly ["usa-reveal", "usa-stagger", "usa-scroll-progress", "usa-scrolly"];
    readonly text: readonly ["usa-typewriter", "usa-split-text", "usa-scramble", "usa-counter", "usa-shimmer-text", "usa-text-rotate", "usa-wave-text", "usa-glitch", "usa-gradient-text", "usa-handwriting", "usa-scroll-highlight"];
    readonly interaction: readonly ["usa-ripple", "usa-magnetic", "usa-tilt", "usa-spotlight", "usa-press"];
    readonly feedback: readonly ["usa-spinner", "usa-skeleton", "usa-progress", "usa-toaster", "usa-check"];
    readonly background: readonly ["usa-aurora", "usa-particles", "usa-grain", "usa-marquee", "usa-acrylic", "usa-grid-glow", "usa-blobs", "usa-water-ripple", "usa-dot-network"];
    readonly transitions: readonly ["usa-dialog", "usa-accordion", "usa-view-switch"];
    readonly physics: readonly ["usa-spring", "usa-draggable", "usa-overscroll"];
    readonly cards: readonly ["usa-card", "usa-card-stack", "usa-sticky-stack", "usa-carousel-3d"];
    readonly click: readonly ["usa-click", "usa-button", "usa-icon-morph", "usa-like", "usa-hold", "usa-double-tap", "usa-checkbox"];
    readonly ui: readonly ["usa-tabs", "usa-drawer", "usa-bottom-sheet", "usa-pull-refresh", "usa-fab", "usa-navbar", "usa-slider", "usa-popover", "usa-badge", "usa-avatar-stack"];
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

/**
 * motionary/components/fx — unified plugin-style effects (5.0).
 * `registerEffect({ name, kind, run })`, `playEffect(el, name)`,
 * `bindEffect(el, name, { trigger })`, `<usa-fx effect trigger>`. Built-ins:
 * every timeline preset (`enter`), `pulse` · `pop` · `jelly` · `wiggle` ·
 * `heartbeat` · `bounce` · `flash` · `tada` · `shake` (attention),
 * `burst` · `confetti` · `ripple` (click). More packs: `motionary/components/effects`.
 */

declare global {
    interface HTMLElementTagNameMap {
        'usa-fx': UsaFxElement;
    }
}

/**
 * Framework-neutral binding for `<usa-*>` elements (v3.8): set DOM
 * **properties** and listen to `usa:*` events, with update / destroy — the
 * shape Svelte actions, Solid directives and Angular directives all share.
 */
interface UsaBinding {
    /** DOM properties to set (`checked`, `value`, `open`, `index`…). */
    props?: Record<string, unknown>;
    /** Event handlers by name; `change` is shorthand for `usa:change`. */
    on?: Record<string, (e: CustomEvent) => void>;
}
/** Normalise an event key: `change` → `usa:change`, `usa:change` stays. */
declare const usaEventName: (k: string) => string;
/** Bind properties and `usa:*` listeners to an element; returns `{ update, destroy }`. */
declare function bindUsa(el: HTMLElement, binding?: UsaBinding): {
    update(b: UsaBinding): void;
    destroy(): void;
};

/** Documented attributes of every shipped `<usa-*>` element, keyed by tag (attribute values are strings / flags). */
interface UsaElementAttributeMap {
    /** `<usa-accordion>` — Accordion (motionary/components/transitions). */
    'usa-accordion': {
        duration?: string | boolean | number;
        multiple?: string | boolean | number;
    };
    /** `<usa-acrylic>` — Acrylic & Mica (motionary/components/background). */
    'usa-acrylic': {
        blur?: string | boolean | number;
        shimmer?: string | boolean | number;
        tint?: string | boolean | number;
        'tint-opacity'?: string | boolean | number;
    };
    /** `<usa-add-to-cart>` — Add to cart (fly-to-cart) (motionary/components/widgets). */
    'usa-add-to-cart': {
        added?: string | boolean | number;
        cart?: string | boolean | number;
        from?: string | boolean | number;
        hold?: string | boolean | number;
        item?: string | boolean | number;
        label?: string | boolean | number;
    };
    /** `<usa-ambient>` — Ambient layer (motionary/components/page). */
    'usa-ambient': {
        color?: string | boolean | number;
        density?: string | boolean | number;
        effect?: string | boolean | number;
        opacity?: string | boolean | number;
        speed?: string | boolean | number;
    };
    /** `<usa-anim-icon>` — Animated icons (motionary/components/svg). */
    'usa-anim-icon': {
        label?: string | boolean | number;
        name?: string | boolean | number;
        size?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-audio>` — Beat-triggered effects (motionary/components/effects). */
    'usa-audio': {
        cooldown?: string | boolean | number;
        label?: string | boolean | number;
        source?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    /** `<usa-aurora>` — Aurora (motionary/components/background). */
    'usa-aurora': {
        colors?: string | boolean | number;
        intensity?: string | boolean | number;
        speed?: string | boolean | number;
    };
    /** `<usa-auto-animate>` — Auto-animate (motionary/components/layout). */
    'usa-auto-animate': {
        duration?: string | boolean | number;
        'no-scale'?: string | boolean | number;
    };
    /** `<usa-auto-skeleton>` — Auto skeleton (motionary/components/page). */
    'usa-auto-skeleton': {
        loading?: string | boolean | number;
    };
    /** `<usa-avatar-stack>` — Avatar stack (motionary/components/ui). */
    'usa-avatar-stack': {
        label?: string | boolean | number;
        max?: string | boolean | number;
        overlap?: string | boolean | number;
        size?: string | boolean | number;
    };
    /** `<usa-back-to-top>` — Back to top (motionary/components/page). */
    'usa-back-to-top': {
        'focus-target'?: string | boolean | number;
        label?: string | boolean | number;
        offset?: string | boolean | number;
    };
    /** `<usa-badge>` — Badge (motionary/components/ui). */
    'usa-badge': {
        dot?: string | boolean | number;
        label?: string | boolean | number;
        max?: string | boolean | number;
        'show-zero'?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-badge-wall>` — Badge wall (motionary/components/widgets). */
    'usa-badge-wall': {
        label?: string | boolean | number;
    };
    /** `<usa-bar-chart>` — Animated bar chart (motionary/components/widgets). */
    'usa-bar-chart': {
        horizontal?: string | boolean | number;
        label?: string | boolean | number;
        labels?: string | boolean | number;
        max?: string | boolean | number;
        unit?: string | boolean | number;
        values?: string | boolean | number;
    };
    /** `<usa-bg-generator>` — Background generator (motionary/components/widgets). */
    'usa-bg-generator': {
        label?: string | boolean | number;
        palette?: string | boolean | number;
        seed?: string | boolean | number;
        style?: string | boolean | number;
    };
    /** `<usa-blobs>` — Fluid blobs (motionary/components/background). */
    'usa-blobs': {
        blur?: string | boolean | number;
        colors?: string | boolean | number;
        speed?: string | boolean | number;
    };
    /** `<usa-bottom-sheet>` — Bottom sheet (motionary/components/ui). */
    'usa-bottom-sheet': {
        open?: string | boolean | number;
        snap?: string | boolean | number;
        start?: string | boolean | number;
    };
    /** `<usa-button>` — Button deformation (motionary/components/click). */
    'usa-button': {
        deform?: string | boolean | number;
        disabled?: string | boolean | number;
        haptic?: string | boolean | number;
        morph?: string | boolean | number;
        reset?: string | boolean | number;
        shape?: string | boolean | number;
        state?: string | boolean | number;
    };
    /** `<usa-card>` — Card (motionary/components/cards). */
    'usa-card': {
        color?: string | boolean | number;
        depth?: string | boolean | number;
        disabled?: string | boolean | number;
        effect?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-card-stack>` — Swipe stack (motionary/components/cards). */
    'usa-card-stack': {
        disabled?: string | boolean | number;
        loop?: string | boolean | number;
        offset?: string | boolean | number;
        threshold?: string | boolean | number;
        visible?: string | boolean | number;
    };
    /** `<usa-carousel>` — Carousel / slider (motionary/components/widgets). */
    'usa-carousel': {
        autoplay?: string | boolean | number;
        effect?: string | boolean | number;
        index?: string | boolean | number;
        label?: string | boolean | number;
        loop?: string | boolean | number;
        'no-controls'?: string | boolean | number;
        'no-dots'?: string | boolean | number;
    };
    /** `<usa-carousel-3d>` — 3D carousel (motionary/components/cards). */
    'usa-carousel-3d': {
        autoplay?: string | boolean | number;
        index?: string | boolean | number;
        perspective?: string | boolean | number;
        radius?: string | boolean | number;
    };
    /** `<usa-cart-drawer>` — Cart drawer (motionary/components/widgets). */
    'usa-cart-drawer': {
        currency?: string | boolean | number;
        items?: string | boolean | number;
        label?: string | boolean | number;
    };
    /** `<usa-chapter-nav>` — Chapter nav (motionary/components/widgets). */
    'usa-chapter-nav': {
        for?: string | boolean | number;
        label?: string | boolean | number;
        orientation?: string | boolean | number;
    };
    /** `<usa-chat-composer>` — AI chat composer (motionary/components/widgets). */
    'usa-chat-composer': {
        busy?: string | boolean | number;
        label?: string | boolean | number;
        placeholder?: string | boolean | number;
        rows?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-check>` — Result icon (motionary/components/feedback). */
    'usa-check': {
        kind?: string | boolean | number;
        label?: string | boolean | number;
        size?: string | boolean | number;
        start?: string | boolean | number;
    };
    /** `<usa-checkbox>` — Animated checkbox (motionary/components/click). */
    'usa-checkbox': {
        checked?: string | boolean | number;
        disabled?: string | boolean | number;
        indeterminate?: string | boolean | number;
        label?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-click>` — Click effects (motionary/components/click). */
    'usa-click': {
        color?: string | boolean | number;
        count?: string | boolean | number;
        disabled?: string | boolean | number;
        effect?: string | boolean | number;
        haptic?: string | boolean | number;
        shape?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-clock-control>` — Motion clock control (motionary/components/widgets). */
    'usa-clock-control': {
        label?: string | boolean | number;
        speeds?: string | boolean | number;
    };
    /** `<usa-code-export>` — Code export (motionary/components/widgets). */
    'usa-code-export': {
        for?: string | boolean | number;
        formats?: string | boolean | number;
    };
    /** `<usa-color-picker>` — Color picker (motionary/components/widgets). */
    'usa-color-picker': {
        swatches?: string | boolean | number;
    };
    /** `<usa-command-palette>` — Command palette (⌘K) (motionary/components/widgets). */
    'usa-command-palette': {
        hotkey?: string | boolean | number;
        inline?: string | boolean | number;
        label?: string | boolean | number;
        placeholder?: string | boolean | number;
    };
    /** `<usa-compare>` — Before / after compare (motionary/components/widgets). */
    'usa-compare': {
        hover?: string | boolean | number;
        intro?: string | boolean | number;
        label?: string | boolean | number;
        labels?: string | boolean | number;
        orientation?: string | boolean | number;
        position?: string | boolean | number;
    };
    /** `<usa-countdown>` — Flip countdown (motionary/components/widgets). */
    'usa-countdown': {
        label?: string | boolean | number;
        labels?: string | boolean | number;
        seconds?: string | boolean | number;
        to?: string | boolean | number;
        units?: string | boolean | number;
    };
    /** `<usa-counter>` — Number counter (motionary/components/text). */
    'usa-counter': {
        decimals?: string | boolean | number;
        duration?: string | boolean | number;
        from?: string | boolean | number;
        grouping?: string | boolean | number;
        locale?: string | boolean | number;
        prefix?: string | boolean | number;
        start?: string | boolean | number;
        suffix?: string | boolean | number;
        to?: string | boolean | number;
    };
    /** `<usa-cube>` — 3D cube (motionary/components/depth). */
    'usa-cube': {
        autoplay?: string | boolean | number;
        perspective?: string | boolean | number;
        size?: string | boolean | number;
    };
    /** `<usa-cube-gallery>` — Cube gallery (motionary/components/widgets). */
    'usa-cube-gallery': {
        autoplay?: string | boolean | number;
        axis?: string | boolean | number;
        label?: string | boolean | number;
    };
    /** `<usa-cursor>` — Custom cursor (motionary/components/page). */
    'usa-cursor': {
        color?: string | boolean | number;
        'hide-native'?: string | boolean | number;
        mode?: string | boolean | number;
        size?: string | boolean | number;
        targets?: string | boolean | number;
    };
    /** `<usa-date-picker>` — Date picker (motionary/components/widgets). */
    'usa-date-picker': {
        'first-day'?: string | boolean | number;
        locale?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
    };
    /** `<usa-depth>` — Depth parallax (motionary/components/depth). */
    'usa-depth': {
        rotate?: string | boolean | number;
        source?: string | boolean | number;
        strength?: string | boolean | number;
    };
    /** `<usa-dialog>` — Modal & drawer (motionary/components/transitions). */
    'usa-dialog': {
        kind?: string | boolean | number;
        label?: string | boolean | number;
        'no-backdrop-close'?: string | boolean | number;
        'no-esc'?: string | boolean | number;
        open?: string | boolean | number;
    };
    /** `<usa-disclosure>` — Accordion 2.0 (motionary/components/widgets). */
    'usa-disclosure': {
        multiple?: string | boolean | number;
        spring?: string | boolean | number;
    };
    /** `<usa-distort>` — Hover distortion (motionary/components/webgl). */
    'usa-distort': {};
    /** `<usa-dock>` — macOS-style dock (motionary/components/widgets). */
    'usa-dock': {
        bounce?: string | boolean | number;
        label?: string | boolean | number;
        magnify?: string | boolean | number;
        orientation?: string | boolean | number;
        range?: string | boolean | number;
    };
    /** `<usa-dot-network>` — Dot network (motionary/components/background). */
    'usa-dot-network': {
        color?: string | boolean | number;
        gap?: string | boolean | number;
        radius?: string | boolean | number;
    };
    /** `<usa-dotlottie>` — Interactive dotLottie (themes + state machine) (motionary/components/dotlottie). */
    'usa-dotlottie': {
        'state-machine'?: string | boolean | number;
        theme?: string | boolean | number;
    };
    /** `<usa-double-tap>` — Double tap (motionary/components/click). */
    'usa-double-tap': {
        color?: string | boolean | number;
        delay?: string | boolean | number;
        disabled?: string | boolean | number;
        icon?: string | boolean | number;
    };
    /** `<usa-draggable>` — Draggable (motionary/components/physics). */
    'usa-draggable': {
        axis?: string | boolean | number;
        bounds?: string | boolean | number;
        disabled?: string | boolean | number;
        inertia?: string | boolean | number;
        preset?: string | boolean | number;
        snap?: string | boolean | number;
        'spring-back'?: string | boolean | number;
        step?: string | boolean | number;
    };
    /** `<usa-draw>` — Line drawing (motionary/components/svg). */
    'usa-draw': {
        duration?: string | boolean | number;
        repeat?: string | boolean | number;
        stagger?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-drawer>` — Drawer (motionary/components/ui). */
    'usa-drawer': {};
    /** `<usa-equalizer>` — Graphic equalizer (motionary/components/widgets). */
    'usa-equalizer': {
        bands?: string | boolean | number;
        label?: string | boolean | number;
        preset?: string | boolean | number;
    };
    /** `<usa-fab>` — FAB speed dial (motionary/components/ui). */
    'usa-fab': {
        direction?: string | boolean | number;
        gap?: string | boolean | number;
    };
    /** `<usa-festival-banner>` — Festival banner (motionary/components/widgets). */
    'usa-festival-banner': {
        dismissible?: string | boolean | number;
        label?: string | boolean | number;
        theme?: string | boolean | number;
    };
    /** `<usa-field>` — Animated field (motionary/components/widgets). */
    'usa-field': {
        error?: string | boolean | number;
        hint?: string | boolean | number;
        label?: string | boolean | number;
        strength?: string | boolean | number;
    };
    /** `<usa-file-drop>` — File drop zone (motionary/components/widgets). */
    'usa-file-drop': {
        accept?: string | boolean | number;
        label?: string | boolean | number;
        multiple?: string | boolean | number;
        simulate?: string | boolean | number;
    };
    /** `<usa-fullpage>` — Full-page sections (motionary/components/page). */
    'usa-fullpage': {
        axis?: string | boolean | number;
        dots?: string | boolean | number;
    };
    /** `<usa-fx>` — Attention seekers (motionary/components/fx). */
    'usa-fx': {
        effect?: string | boolean | number;
        once?: string | boolean | number;
        options?: string | boolean | number;
        self?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-gauge>` — Spring gauge (motionary/components/widgets). */
    'usa-gauge': {
        label?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
        unit?: string | boolean | number;
        value?: string | boolean | number;
        zones?: string | boolean | number;
    };
    /** `<usa-gen-art>` — Generative artwork (motionary/components/widgets). */
    'usa-gen-art': {
        art?: string | boolean | number;
        label?: string | boolean | number;
        palette?: string | boolean | number;
        seed?: string | boolean | number;
    };
    /** `<usa-gesture-fx>` — Gesture triggers (motionary/components/effects). */
    'usa-gesture-fx': {
        angle?: string | boolean | number;
        duration?: string | boolean | number;
        effect?: string | boolean | number;
        gesture?: string | boolean | number;
        options?: string | boolean | number;
        self?: string | boolean | number;
        velocity?: string | boolean | number;
    };
    /** `<usa-gesture-sticker>` — Multi-touch sticker (motionary/components/widgets). */
    'usa-gesture-sticker': {
        label?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
    };
    /** `<usa-gl-model>` — Compressed 3D model (Draco / KTX2) (motionary/components/gl-model). */
    'usa-gl-model': {};
    /** `<usa-gl-scene>` — 3D scene (glTF / OBJ) (motionary/components/widgets). */
    'usa-gl-scene': {
        animation?: string | boolean | number;
        'animation-speed'?: string | boolean | number;
        'auto-rotate'?: string | boolean | number;
        background?: string | boolean | number;
        color?: string | boolean | number;
        controls?: string | boolean | number;
        exposure?: string | boolean | number;
        label?: string | boolean | number;
        metallic?: string | boolean | number;
        roughness?: string | boolean | number;
        shape?: string | boolean | number;
        src?: string | boolean | number;
        video?: string | boolean | number;
        'video-scrub'?: string | boolean | number;
    };
    /** `<usa-glitch>` — Glitch text (motionary/components/text). */
    'usa-glitch': {
        intensity?: string | boolean | number;
        text?: string | boolean | number;
    };
    /** `<usa-globe>` — Spinning globe (motionary/components/widgets). */
    'usa-globe': {
        lon?: string | boolean | number;
        markers?: string | boolean | number;
        speed?: string | boolean | number;
        tilt?: string | boolean | number;
    };
    /** `<usa-gpu-particles>` — GPU particle canvas (motionary/components/widgets). */
    'usa-gpu-particles': {
        colors?: string | boolean | number;
        count?: string | boolean | number;
        label?: string | boolean | number;
        mode?: string | boolean | number;
        pointer?: string | boolean | number;
        size?: string | boolean | number;
        speed?: string | boolean | number;
        trail?: string | boolean | number;
    };
    /** `<usa-gradient-text>` — Gradient flow (motionary/components/text). */
    'usa-gradient-text': {
        angle?: string | boolean | number;
        colors?: string | boolean | number;
        speed?: string | boolean | number;
    };
    /** `<usa-grain>` — Film grain (motionary/components/background). */
    'usa-grain': {
        blend?: string | boolean | number;
        opacity?: string | boolean | number;
        scale?: string | boolean | number;
    };
    /** `<usa-grid-glow>` — Grid glow (motionary/components/background). */
    'usa-grid-glow': {
        color?: string | boolean | number;
        radius?: string | boolean | number;
        size?: string | boolean | number;
    };
    /** `<usa-gyro-card>` — Gyro 3D card (motionary/components/widgets). */
    'usa-gyro-card': {
        glare?: string | boolean | number;
        max?: string | boolean | number;
    };
    /** `<usa-handwriting>` — Handwriting draw (motionary/components/text). */
    'usa-handwriting': {
        duration?: string | boolean | number;
        font?: string | boolean | number;
        size?: string | boolean | number;
        stroke?: string | boolean | number;
        text?: string | boolean | number;
    };
    /** `<usa-hero-video>` — Hero video (motionary/components/widgets). */
    'usa-hero-video': {
        label?: string | boolean | number;
        poster?: string | boolean | number;
        scrub?: string | boolean | number;
    };
    /** `<usa-hold>` — Hold to confirm (motionary/components/click). */
    'usa-hold': {
        color?: string | boolean | number;
        disabled?: string | boolean | number;
        duration?: string | boolean | number;
        label?: string | boolean | number;
    };
    /** `<usa-hud-panel>` — HUD panel (motionary/components/widgets). */
    'usa-hud-panel': {
        color?: string | boolean | number;
        status?: string | boolean | number;
        title?: string | boolean | number;
    };
    /** `<usa-hydrate>` — SSR hydration animation (motionary/components/widgets). */
    'usa-hydrate': {
        duration?: string | boolean | number;
        effect?: string | boolean | number;
        stagger?: string | boolean | number;
    };
    /** `<usa-icon-morph>` — Icon morph (motionary/components/click). */
    'usa-icon-morph': {
        icons?: string | boolean | number;
        index?: string | boolean | number;
        labels?: string | boolean | number;
        preset?: string | boolean | number;
        size?: string | boolean | number;
        toggle?: string | boolean | number;
    };
    /** `<usa-install-button>` — Install button (motionary/components/widgets). */
    'usa-install-button': {
        cdn?: string | boolean | number;
        dev?: string | boolean | number;
        manager?: string | boolean | number;
        managers?: string | boolean | number;
        package?: string | boolean | number;
    };
    /** `<usa-kanban>` — Kanban board (drag-sort) (motionary/components/widgets). */
    'usa-kanban': {
        label?: string | boolean | number;
    };
    /** `<usa-keyframe-editor>` — Animation editor 2.0 (motionary/components/widgets). */
    'usa-keyframe-editor': {
        for?: string | boolean | number;
    };
    /** `<usa-kpi>` — KPI card (motionary/components/widgets). */
    'usa-kpi': {
        caption?: string | boolean | number;
        delta?: string | boolean | number;
        invert?: string | boolean | number;
        label?: string | boolean | number;
        locale?: string | boolean | number;
        trend?: string | boolean | number;
    };
    /** `<usa-leaderboard>` — Leaderboard (motionary/components/widgets). */
    'usa-leaderboard': {
        label?: string | boolean | number;
        limit?: string | boolean | number;
        me?: string | boolean | number;
    };
    /** `<usa-like>` — Like button (motionary/components/click). */
    'usa-like': {
        color?: string | boolean | number;
        count?: string | boolean | number;
        disabled?: string | boolean | number;
        haptic?: string | boolean | number;
        label?: string | boolean | number;
        liked?: string | boolean | number;
        size?: string | boolean | number;
    };
    /** `<usa-liquid>` — Liquid image (motionary/components/webgl). */
    'usa-liquid': {};
    /** `<usa-liquid-nav>` — Liquid nav (motionary/components/widgets). */
    'usa-liquid-nav': {
        label?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-loading-bar>` — Top loading bar (motionary/components/page). */
    'usa-loading-bar': {
        color?: string | boolean | number;
        height?: string | boolean | number;
        label?: string | boolean | number;
    };
    /** `<usa-location-card>` — Location card (motionary/components/widgets). */
    'usa-location-card': {
        address?: string | boolean | number;
        distance?: string | boolean | number;
        'from-lat'?: string | boolean | number;
        'from-lon'?: string | boolean | number;
        href?: string | boolean | number;
        lat?: string | boolean | number;
        lon?: string | boolean | number;
        name?: string | boolean | number;
        unit?: string | boolean | number;
    };
    /** `<usa-lottie>` — Lottie player (motionary/components/widgets). */
    'usa-lottie': {
        label?: string | boolean | number;
        loop?: string | boolean | number;
        speed?: string | boolean | number;
        src?: string | boolean | number;
    };
    /** `<usa-lottie-icon>` — Animated icon set (motionary/components/widgets). */
    'usa-lottie-icon': {
        color?: string | boolean | number;
        label?: string | boolean | number;
        name?: string | boolean | number;
        size?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-lottie-player>` — Lottie player (JSON + dotLottie) (motionary/components/widgets). */
    'usa-lottie-player': {
        animation?: string | boolean | number;
        autoplay?: string | boolean | number;
        background?: string | boolean | number;
        fit?: string | boolean | number;
        hover?: string | boolean | number;
        label?: string | boolean | number;
        loop?: string | boolean | number;
        mode?: string | boolean | number;
        scrub?: string | boolean | number;
        segment?: string | boolean | number;
        speed?: string | boolean | number;
        src?: string | boolean | number;
    };
    /** `<usa-lyrics>` — Synced karaoke lyrics (motionary/components/widgets). */
    'usa-lyrics': {
        for?: string | boolean | number;
        label?: string | boolean | number;
    };
    /** `<usa-magnetic>` — Magnetic button (motionary/components/interaction). */
    'usa-magnetic': {
        disabled?: string | boolean | number;
        radius?: string | boolean | number;
        strength?: string | boolean | number;
    };
    /** `<usa-marquee>` — Marquee (motionary/components/background). */
    'usa-marquee': {
        direction?: string | boolean | number;
        gap?: string | boolean | number;
        'pause-on-hover'?: string | boolean | number;
        paused?: string | boolean | number;
        speed?: string | boolean | number;
    };
    /** `<usa-mask-reveal>` — Mask reveal (motionary/components/svg). */
    'usa-mask-reveal': {
        at?: string | boolean | number;
        delay?: string | boolean | number;
        duration?: string | boolean | number;
        repeat?: string | boolean | number;
        shape?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-masonry>` — Masonry (motionary/components/layout). */
    'usa-masonry': {
        columns?: string | boolean | number;
        gap?: string | boolean | number;
        min?: string | boolean | number;
    };
    /** `<usa-masonry-flow>` — Masonry with layout animation (motionary/components/widgets). */
    'usa-masonry-flow': {
        gap?: string | boolean | number;
        min?: string | boolean | number;
    };
    /** `<usa-menu>` — Dropdown menu (motionary/components/widgets). */
    'usa-menu': {
        effect?: string | boolean | number;
        placement?: string | boolean | number;
    };
    /** `<usa-menu-toggle>` — Hamburger → close (motionary/components/widgets). */
    'usa-menu-toggle': {
        for?: string | boolean | number;
        label?: string | boolean | number;
        variant?: string | boolean | number;
    };
    /** `<usa-message-list>` — Chat thread (motionary/components/widgets). */
    'usa-message-list': {
        label?: string | boolean | number;
    };
    /** `<usa-milestones>` — Scroll-drawn milestones (motionary/components/widgets). */
    'usa-milestones': {
        layout?: string | boolean | number;
    };
    /** `<usa-modal>` — Modal dialog (motionary/components/widgets). */
    'usa-modal': {
        effect?: string | boolean | number;
        label?: string | boolean | number;
        persistent?: string | boolean | number;
    };
    /** `<usa-morph>` — Path morph (motionary/components/svg). */
    'usa-morph': {
        duration?: string | boolean | number;
        interval?: string | boolean | number;
        paths?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-motion>` — Motion DSL (motionary/components/widgets). */
    'usa-motion': {
        rules?: string | boolean | number;
    };
    /** `<usa-motion-inspector>` — Motion inspector (motionary/components/widgets). */
    'usa-motion-inspector': {
        interval?: string | boolean | number;
        scope?: string | boolean | number;
    };
    /** `<usa-motion-prefs>` — Motion preference panel (motionary/components/widgets). */
    'usa-motion-prefs': {
        label?: string | boolean | number;
    };
    /** `<usa-motion-prompt>` — Motion prompt (text → motion) (motionary/components/widgets). */
    'usa-motion-prompt': {
        format?: string | boolean | number;
        label?: string | boolean | number;
        placeholder?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-motion-spec>` — Motion spec sheet (motionary/components/widgets). */
    'usa-motion-spec': {
        label?: string | boolean | number;
        rules?: string | boolean | number;
    };
    /** `<usa-motion-switch>` — Motion intensity (motionary/components/page). */
    'usa-motion-switch': {
        label?: string | boolean | number;
        labels?: string | boolean | number;
    };
    /** `<usa-motion-theme>` — Theme packs (motionary/components/effects). */
    'usa-motion-theme': {
        name?: string | boolean | number;
    };
    /** `<usa-music-player>` — Music player (motionary/components/widgets). */
    'usa-music-player': {
        artist?: string | boolean | number;
        cover?: string | boolean | number;
        duration?: string | boolean | number;
        src?: string | boolean | number;
        title?: string | boolean | number;
    };
    /** `<usa-native-preview>` — Native preview (motionary/components/widgets). */
    'usa-native-preview': {
        name?: string | boolean | number;
        platform?: string | boolean | number;
        rules?: string | boolean | number;
    };
    /** `<usa-nav-morph>` — Navbar with morphing indicator (motionary/components/widgets). */
    'usa-nav-morph': {
        active?: string | boolean | number;
        indicator?: string | boolean | number;
        label?: string | boolean | number;
    };
    /** `<usa-navbar>` — Auto-hide navbar (motionary/components/ui). */
    'usa-navbar': {
        target?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    /** `<usa-notification-bell>` — Notification bell (motionary/components/widgets). */
    'usa-notification-bell': {
        label?: string | boolean | number;
    };
    /** `<usa-odometer>` — Odometer counter (motionary/components/widgets). */
    'usa-odometer': {
        decimals?: string | boolean | number;
        duration?: string | boolean | number;
        locale?: string | boolean | number;
        prefix?: string | boolean | number;
        suffix?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-organic-card>` — Organic card (motionary/components/widgets). */
    'usa-organic-card': {
        seed?: string | boolean | number;
        tint?: string | boolean | number;
    };
    /** `<usa-otp>` — OTP code input (motionary/components/widgets). */
    'usa-otp': {
        label?: string | boolean | number;
        length?: string | boolean | number;
        mode?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-overscroll>` — Elastic overscroll (motionary/components/physics). */
    'usa-overscroll': {
        axis?: string | boolean | number;
        disabled?: string | boolean | number;
        max?: string | boolean | number;
        preset?: string | boolean | number;
    };
    /** `<usa-pack>` — E-commerce pack (motionary/components/packs). */
    'usa-pack': {
        name?: string | boolean | number;
    };
    /** `<usa-pagination>` — Pagination with sliding ink (motionary/components/widgets). */
    'usa-pagination': {
        label?: string | boolean | number;
        siblings?: string | boolean | number;
        total?: string | boolean | number;
    };
    /** `<usa-panorama>` — 360° panorama viewer (motionary/components/widgets). */
    'usa-panorama': {
        autorotate?: string | boolean | number;
        label?: string | boolean | number;
        src?: string | boolean | number;
    };
    /** `<usa-parallax-layers>` — Parallax layers (motionary/components/widgets). */
    'usa-parallax-layers': {
        engine?: string | boolean | number;
        horizontal?: string | boolean | number;
        pointer?: string | boolean | number;
        preview?: string | boolean | number;
        range?: string | boolean | number;
        strength?: string | boolean | number;
    };
    /** `<usa-particles>` — Particles (motionary/components/background). */
    'usa-particles': {
        color?: string | boolean | number;
        count?: string | boolean | number;
        interactive?: string | boolean | number;
        links?: string | boolean | number;
        paused?: string | boolean | number;
        size?: string | boolean | number;
        speed?: string | boolean | number;
    };
    /** `<usa-pause-all>` — Pause all motion (motionary/components/widgets). */
    'usa-pause-all': {
        label?: string | boolean | number;
        'resume-label'?: string | boolean | number;
        scope?: string | boolean | number;
    };
    /** `<usa-perf-monitor>` — Perf monitor (motionary/components/widgets). */
    'usa-perf-monitor': {
        corner?: string | boolean | number;
        warn?: string | boolean | number;
    };
    /** `<usa-physics-playground>` — Physics playground (motionary/components/widgets). */
    'usa-physics-playground': {
        gravity?: string | boolean | number;
        label?: string | boolean | number;
        preset?: string | boolean | number;
        spawn?: string | boolean | number;
        src?: string | boolean | number;
    };
    /** `<usa-pinch-zoom>` — Pinch zoom (motionary/components/gesture). */
    'usa-pinch-zoom': {
        'double-tap'?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
        preset?: string | boolean | number;
    };
    /** `<usa-player>` — JSON animation player (motionary/components/effects). */
    'usa-player': {
        controls?: string | boolean | number;
        loop?: string | boolean | number;
        rate?: string | boolean | number;
        src?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-plugin-card>` — Plugin detail card (motionary/components/widgets). */
    'usa-plugin-card': {
        author?: string | boolean | number;
        downloads?: string | boolean | number;
        engine?: string | boolean | number;
        integrity?: string | boolean | number;
        name?: string | boolean | number;
        src?: string | boolean | number;
        title?: string | boolean | number;
        version?: string | boolean | number;
    };
    /** `<usa-plugin-store>` — Plugin marketplace (motionary/components/widgets). */
    'usa-plugin-store': {
        label?: string | boolean | number;
        query?: string | boolean | number;
    };
    /** `<usa-popover>` — Popover (motionary/components/ui). */
    'usa-popover': {
        placement?: string | boolean | number;
    };
    /** `<usa-post-fx>` — Post-processing (motionary/components/webgl). */
    'usa-post-fx': {};
    /** `<usa-presence>` — Presence avatar (motionary/components/widgets). */
    'usa-presence': {
        name?: string | boolean | number;
        speaking?: string | boolean | number;
        src?: string | boolean | number;
        status?: string | boolean | number;
    };
    /** `<usa-press>` — Press feedback (motionary/components/interaction). */
    'usa-press': {
        bounce?: string | boolean | number;
        disabled?: string | boolean | number;
        scale?: string | boolean | number;
    };
    /** `<usa-prize-wheel>` — Prize wheel (motionary/components/widgets). */
    'usa-prize-wheel': {
        duration?: string | boolean | number;
        label?: string | boolean | number;
        segments?: string | boolean | number;
        turns?: string | boolean | number;
    };
    /** `<usa-product-gallery>` — Product gallery (motionary/components/widgets). */
    'usa-product-gallery': {
        index?: string | boolean | number;
        nozoom?: string | boolean | number;
        zoom?: string | boolean | number;
    };
    /** `<usa-progress>` — Progress bar (motionary/components/feedback). */
    'usa-progress': {
        indeterminate?: string | boolean | number;
        label?: string | boolean | number;
        max?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-progress-ring>` — Progress ring / bar / gauge (motionary/components/widgets). */
    'usa-progress-ring': {
        duration?: string | boolean | number;
        gradient?: string | boolean | number;
        max?: string | boolean | number;
        'no-label'?: string | boolean | number;
        value?: string | boolean | number;
        variant?: string | boolean | number;
    };
    /** `<usa-prop-panel>` — Property panel (motionary/components/widgets). */
    'usa-prop-panel': {
        for?: string | boolean | number;
        label?: string | boolean | number;
        props?: string | boolean | number;
    };
    /** `<usa-pull-cord>` — Lamp pull-cord switch (motionary/components/widgets). */
    'usa-pull-cord': {
        label?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    /** `<usa-pull-refresh>` — Pull to refresh (motionary/components/ui). */
    'usa-pull-refresh': {
        disabled?: string | boolean | number;
        label?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    /** `<usa-radar>` — Radar scope (motionary/components/widgets). */
    'usa-radar': {
        label?: string | boolean | number;
        rings?: string | boolean | number;
        speed?: string | boolean | number;
        targets?: string | boolean | number;
    };
    /** `<usa-reactions>` — Emoji reactions (motionary/components/widgets). */
    'usa-reactions': {
        counts?: string | boolean | number;
        emojis?: string | boolean | number;
        picker?: string | boolean | number;
    };
    /** `<usa-red-envelope>` — Red envelope (红包) (motionary/components/widgets). */
    'usa-red-envelope': {
        amount?: string | boolean | number;
        currency?: string | boolean | number;
        from?: string | boolean | number;
        message?: string | boolean | number;
        opened?: string | boolean | number;
    };
    /** `<usa-retro-button>` — Retro buttons (motionary/components/widgets). */
    'usa-retro-button': {
        disabled?: string | boolean | number;
        type?: string | boolean | number;
        variant?: string | boolean | number;
    };
    /** `<usa-reveal>` — Reveal (motionary/components/reveal). */
    'usa-reveal': {
        delay?: string | boolean | number;
        distance?: string | boolean | number;
        duration?: string | boolean | number;
        easing?: string | boolean | number;
        effect?: string | boolean | number;
        repeat?: string | boolean | number;
        'root-margin'?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    /** `<usa-ripple>` — Ripple (motionary/components/interaction). */
    'usa-ripple': {
        centered?: string | boolean | number;
        color?: string | boolean | number;
        disabled?: string | boolean | number;
        duration?: string | boolean | number;
        opacity?: string | boolean | number;
    };
    /** `<usa-rive>` — Rive player (official runtime) (motionary/components/widgets). */
    'usa-rive': {
        animation?: string | boolean | number;
        artboard?: string | boolean | number;
        autoplay?: string | boolean | number;
        fit?: string | boolean | number;
        label?: string | boolean | number;
        'runtime-src'?: string | boolean | number;
        src?: string | boolean | number;
        'state-machine'?: string | boolean | number;
    };
    /** `<usa-route-transition>` — Route transition container (motionary/components/widgets). */
    'usa-route-transition': {
        'cross-document'?: string | boolean | number;
        current?: string | boolean | number;
        effect?: string | boolean | number;
        engine?: string | boolean | number;
        history?: string | boolean | number;
        links?: string | boolean | number;
        selector?: string | boolean | number;
    };
    /** `<usa-scene>` — Cinematic scene (motionary/components/widgets). */
    'usa-scene': {
        autoplay?: string | boolean | number;
        camera?: string | boolean | number;
        strength?: string | boolean | number;
    };
    /** `<usa-scramble>` — Scramble / decode (motionary/components/text). */
    'usa-scramble': {
        chars?: string | boolean | number;
        duration?: string | boolean | number;
        text?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-scroll-highlight>` — Scroll highlight (motionary/components/text). */
    'usa-scroll-highlight': {
        color?: string | boolean | number;
        dim?: string | boolean | number;
        mode?: string | boolean | number;
        text?: string | boolean | number;
    };
    /** `<usa-scroll-progress>` — Scroll progress bar (motionary/components/reveal). */
    'usa-scroll-progress': {
        label?: string | boolean | number;
        target?: string | boolean | number;
    };
    /** `<usa-scroll-ring>` — Scroll progress ring (motionary/components/widgets). */
    'usa-scroll-ring': {
        'back-to-top'?: string | boolean | number;
        engine?: string | boolean | number;
        for?: string | boolean | number;
        horizontal?: string | boolean | number;
        label?: string | boolean | number;
        preview?: string | boolean | number;
        size?: string | boolean | number;
        thickness?: string | boolean | number;
    };
    /** `<usa-scroll-scene>` — Scroll scene (motionary/components/widgets). */
    'usa-scroll-scene': {
        end?: string | boolean | number;
        markers?: string | boolean | number;
        pin?: string | boolean | number;
        preview?: string | boolean | number;
        scrub?: string | boolean | number;
        stagger?: string | boolean | number;
        start?: string | boolean | number;
        'toggle-class'?: string | boolean | number;
    };
    /** `<usa-scrolly>` — Sticky scrollytelling (motionary/components/reveal). */
    'usa-scrolly': {
        offset?: string | boolean | number;
    };
    /** `<usa-segmented>` — Segmented control (motionary/components/widgets). */
    'usa-segmented': {
        label?: string | boolean | number;
        value?: string | boolean | number;
        variant?: string | boolean | number;
    };
    /** `<usa-shader>` — Shader background (motionary/components/webgl). */
    'usa-shader': {};
    /** `<usa-shader-backdrop>` — Shader backdrop + post chain (motionary/components/widgets). */
    'usa-shader-backdrop': {
        colors?: string | boolean | number;
        intensity?: string | boolean | number;
        label?: string | boolean | number;
        post?: string | boolean | number;
        preset?: string | boolean | number;
        speed?: string | boolean | number;
    };
    /** `<usa-sheet>` — Drawer / bottom sheet (motionary/components/widgets). */
    'usa-sheet': {
        label?: string | boolean | number;
        persistent?: string | boolean | number;
        side?: string | boolean | number;
    };
    /** `<usa-shimmer-text>` — Shimmer text (motionary/components/text). */
    'usa-shimmer-text': {
        angle?: string | boolean | number;
        color?: string | boolean | number;
        duration?: string | boolean | number;
        shine?: string | boolean | number;
    };
    /** `<usa-shortcut>` — Shortcut hint (motionary/components/widgets). */
    'usa-shortcut': {
        for?: string | boolean | number;
        keys?: string | boolean | number;
        label?: string | boolean | number;
        listen?: string | boolean | number;
    };
    /** `<usa-skeleton>` — Skeleton (motionary/components/feedback). */
    'usa-skeleton': {
        avatar?: string | boolean | number;
        circle?: string | boolean | number;
        height?: string | boolean | number;
        lines?: string | boolean | number;
        loading?: string | boolean | number;
        radius?: string | boolean | number;
        width?: string | boolean | number;
    };
    /** `<usa-skeleton-reveal>` — Skeleton → content reveal (motionary/components/widgets). */
    'usa-skeleton-reveal': {
        loading?: string | boolean | number;
        variant?: string | boolean | number;
    };
    /** `<usa-sketch-chart>` — Sketch chart (motionary/components/widgets). */
    'usa-sketch-chart': {
        color?: string | boolean | number;
        label?: string | boolean | number;
        labels?: string | boolean | number;
        type?: string | boolean | number;
        values?: string | boolean | number;
    };
    /** `<usa-slider>` — Slider (motionary/components/ui). */
    'usa-slider': {
        disabled?: string | boolean | number;
        label?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
        step?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-smooth-scroll>` — Smooth scroll (motionary/components/widgets). */
    'usa-smooth-scroll': {
        anchors?: string | boolean | number;
        duration?: string | boolean | number;
        ease?: string | boolean | number;
        horizontal?: string | boolean | number;
        lerp?: string | boolean | number;
        offset?: string | boolean | number;
        preview?: string | boolean | number;
        touch?: string | boolean | number;
        'wheel-multiplier'?: string | boolean | number;
        wrapper?: string | boolean | number;
    };
    /** `<usa-snap-carousel>` — Snap carousel (drag · inertia · snap) (motionary/components/snap-carousel). */
    'usa-snap-carousel': {
        align?: string | boolean | number;
        autoplay?: string | boolean | number;
        gap?: string | boolean | number;
        index?: string | boolean | number;
        label?: string | boolean | number;
        'no-controls'?: string | boolean | number;
        'no-dots'?: string | boolean | number;
    };
    /** `<usa-sparkline>` — Sparkline (motionary/components/widgets). */
    'usa-sparkline': {
        color?: string | boolean | number;
        label?: string | boolean | number;
        values?: string | boolean | number;
        variant?: string | boolean | number;
    };
    /** `<usa-spatial-card>` — Spatial card (motionary/components/widgets). */
    'usa-spatial-card': {};
    /** `<usa-spinner>` — Spinners (motionary/components/feedback). */
    'usa-spinner': {
        kind?: string | boolean | number;
        label?: string | boolean | number;
        size?: string | boolean | number;
    };
    /** `<usa-splash>` — Splash screen (motionary/components/page). */
    'usa-splash': {
        exit?: string | boolean | number;
        label?: string | boolean | number;
        manual?: string | boolean | number;
        min?: string | boolean | number;
    };
    /** `<usa-split-text>` — Split-text reveal (motionary/components/text). */
    'usa-split-text': {
        by?: string | boolean | number;
        delay?: string | boolean | number;
        duration?: string | boolean | number;
        from?: string | boolean | number;
        repeat?: string | boolean | number;
        stagger?: string | boolean | number;
        text?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-spotlight>` — Reveal highlight (motionary/components/interaction). */
    'usa-spotlight': {
        border?: string | boolean | number;
        color?: string | boolean | number;
        size?: string | boolean | number;
    };
    /** `<usa-spring>` — Spring effects (motionary/components/physics). */
    'usa-spring': {
        damping?: string | boolean | number;
        delay?: string | boolean | number;
        duration?: string | boolean | number;
        effect?: string | boolean | number;
        mass?: string | boolean | number;
        preset?: string | boolean | number;
        repeat?: string | boolean | number;
        stiffness?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-stagger>` — Stagger list (motionary/components/reveal). */
    'usa-stagger': {
        delay?: string | boolean | number;
        distance?: string | boolean | number;
        duration?: string | boolean | number;
        easing?: string | boolean | number;
        effect?: string | boolean | number;
        interval?: string | boolean | number;
        repeat?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    /** `<usa-star-rating>` — Star rating 2.0 (motionary/components/widgets). */
    'usa-star-rating': {
        icon?: string | boolean | number;
        label?: string | boolean | number;
        max?: string | boolean | number;
        readonly?: string | boolean | number;
        step?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-stepper>` — Stepper / wizard (motionary/components/widgets). */
    'usa-stepper': {
        clickable?: string | boolean | number;
        label?: string | boolean | number;
        orientation?: string | boolean | number;
    };
    /** `<usa-sticky-stack>` — Sticky stack (motionary/components/cards). */
    'usa-sticky-stack': {
        gap?: string | boolean | number;
        scale?: string | boolean | number;
        top?: string | boolean | number;
    };
    /** `<usa-sticky-wall>` — Sticky-note wall (motionary/components/widgets). */
    'usa-sticky-wall': {
        label?: string | boolean | number;
        seed?: string | boolean | number;
    };
    /** `<usa-stories>` — Stories viewer (motionary/components/widgets). */
    'usa-stories': {
        duration?: string | boolean | number;
        loop?: string | boolean | number;
    };
    /** `<usa-story>` — Story: before / after (motionary/components/effects). */
    'usa-story': {
        label?: string | boolean | number;
        template?: string | boolean | number;
        zoom?: string | boolean | number;
    };
    /** `<usa-suggestion-chips>` — Suggestion chips (motionary/components/widgets). */
    'usa-suggestion-chips': {
        dismiss?: string | boolean | number;
        items?: string | boolean | number;
        label?: string | boolean | number;
    };
    /** `<usa-swipe-deck>` — Swipe cards deck (motionary/components/widgets). */
    'usa-swipe-deck': {
        label?: string | boolean | number;
        threshold?: string | boolean | number;
    };
    /** `<usa-swipeable>` — Swipeable (motionary/components/gesture). */
    'usa-swipeable': {
        axis?: string | boolean | number;
        disabled?: string | boolean | number;
        dismiss?: string | boolean | number;
        distance?: string | boolean | number;
        preset?: string | boolean | number;
    };
    /** `<usa-switch>` — Toggle switch variants (motionary/components/widgets). */
    'usa-switch': {
        disabled?: string | boolean | number;
        label?: string | boolean | number;
        name?: string | boolean | number;
        value?: string | boolean | number;
        variant?: string | boolean | number;
    };
    /** `<usa-tab-bar>` — Tabs with animated indicator (motionary/components/widgets). */
    'usa-tab-bar': {
        indicator?: string | boolean | number;
        label?: string | boolean | number;
        selected?: string | boolean | number;
    };
    /** `<usa-tabs>` — Tabs (motionary/components/ui). */
    'usa-tabs': {
        indicator?: string | boolean | number;
    };
    /** `<usa-terminal>` — Terminal window (motionary/components/widgets). */
    'usa-terminal': {
        loop?: string | boolean | number;
        prompt?: string | boolean | number;
        speed?: string | boolean | number;
        theme?: string | boolean | number;
        title?: string | boolean | number;
    };
    /** `<usa-text-rotate>` — Rotating words (motionary/components/text). */
    'usa-text-rotate': {
        effect?: string | boolean | number;
        interval?: string | boolean | number;
        paused?: string | boolean | number;
        words?: string | boolean | number;
    };
    /** `<usa-text-splitter>` — Text splitter (motionary/components/widgets). */
    'usa-text-splitter': {
        duration?: string | boolean | number;
        effect?: string | boolean | number;
        loop?: string | boolean | number;
        split?: string | boolean | number;
        stagger?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-theme-surface>` — Theme surface (motionary/components/widgets). */
    'usa-theme-surface': {
        theme?: string | boolean | number;
    };
    /** `<usa-theme-switcher>` — Theme switcher (motionary/components/widgets). */
    'usa-theme-switcher': {
        label?: string | boolean | number;
        persist?: string | boolean | number;
        target?: string | boolean | number;
        themes?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-tilt>` — 3D tilt card (motionary/components/interaction). */
    'usa-tilt': {
        disabled?: string | boolean | number;
        glare?: string | boolean | number;
        max?: string | boolean | number;
        perspective?: string | boolean | number;
        reverse?: string | boolean | number;
        scale?: string | boolean | number;
    };
    /** `<usa-timeline>` — Timeline (motionary/components/timeline). */
    'usa-timeline': {
        duration?: string | boolean | number;
        overlap?: string | boolean | number;
        repeat?: string | boolean | number;
        scrub?: string | boolean | number;
        smooth?: string | boolean | number;
        stagger?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-tip>` — Tooltip / popover 2.0 (motionary/components/widgets). */
    'usa-tip': {
        delay?: string | boolean | number;
        placement?: string | boolean | number;
        text?: string | boolean | number;
        trigger?: string | boolean | number;
    };
    /** `<usa-toast-stack>` — Toast stack (motionary/components/widgets). */
    'usa-toast-stack': {
        duration?: string | boolean | number;
        max?: string | boolean | number;
        position?: string | boolean | number;
    };
    /** `<usa-toaster>` — Toasts (motionary/components/feedback). */
    'usa-toaster': {
        label?: string | boolean | number;
        max?: string | boolean | number;
        position?: string | boolean | number;
    };
    /** `<usa-token-editor>` — Motion token editor (W3C DTCG) (motionary/components/widgets). */
    'usa-token-editor': {
        apply?: string | boolean | number;
        format?: string | boolean | number;
        groups?: string | boolean | number;
        label?: string | boolean | number;
    };
    /** `<usa-typewriter>` — Typewriter (motionary/components/text). */
    'usa-typewriter': {
        delay?: string | boolean | number;
        'delete-speed'?: string | boolean | number;
        loop?: string | boolean | number;
        pause?: string | boolean | number;
        speed?: string | boolean | number;
        start?: string | boolean | number;
        text?: string | boolean | number;
        words?: string | boolean | number;
    };
    /** `<usa-upload-progress>` — Upload progress (motionary/components/widgets). */
    'usa-upload-progress': {
        message?: string | boolean | number;
        name?: string | boolean | number;
        size?: string | boolean | number;
        status?: string | boolean | number;
        value?: string | boolean | number;
    };
    /** `<usa-video-card>` — Video card (motionary/components/widgets). */
    'usa-video-card': {
        duration?: string | boolean | number;
        label?: string | boolean | number;
    };
    /** `<usa-view-switch>` — View switch (motionary/components/transitions). */
    'usa-view-switch': {
        active?: string | boolean | number;
        duration?: string | boolean | number;
        effect?: string | boolean | number;
    };
    /** `<usa-voice-button>` — Voice button (motionary/components/widgets). */
    'usa-voice-button': {
        bars?: string | boolean | number;
        label?: string | boolean | number;
        listening?: string | boolean | number;
    };
    /** `<usa-volume-knob>` — Volume knob (motionary/components/widgets). */
    'usa-volume-knob': {
        label?: string | boolean | number;
        max?: string | boolean | number;
        min?: string | boolean | number;
    };
    /** `<usa-water-ripple>` — Water ripple (motionary/components/background). */
    'usa-water-ripple': {
        color?: string | boolean | number;
        damping?: string | boolean | number;
        strength?: string | boolean | number;
    };
    /** `<usa-wave-text>` — Wave text (motionary/components/text). */
    'usa-wave-text': {
        amplitude?: string | boolean | number;
        speed?: string | boolean | number;
        stagger?: string | boolean | number;
        text?: string | boolean | number;
    };
    /** `<usa-weather-card>` — Animated weather card (motionary/components/widgets). */
    'usa-weather-card': {
        condition?: string | boolean | number;
        label?: string | boolean | number;
        place?: string | boolean | number;
        temp?: string | boolean | number;
        unit?: string | boolean | number;
    };
    /** `<usa-worker-canvas>` — Worker canvas (motionary/components/widgets). */
    'usa-worker-canvas': {
        label?: string | boolean | number;
        scene?: string | boolean | number;
    };
    /** `<usa-xp-bar>` — XP bar (motionary/components/widgets). */
    'usa-xp-bar': {
        level?: string | boolean | number;
        per?: string | boolean | number;
        xp?: string | boolean | number;
    };
}
/** Every shipped `<usa-*>` tag. */
type UsaElementTag = keyof UsaElementAttributeMap;

/**
 * motionary/components/jsx — JSX typings for the raw `<usa-*>` tags (v2.9).
 *
 * ```ts
 * // src/usa-jsx.d.ts (React 18/19)
 * import type { UsaIntrinsicElements } from 'motionary/components/jsx';
 * declare module 'react' { namespace JSX { interface IntrinsicElements extends UsaIntrinsicElements {} } }
 * // Solid / Preact / other JSX: extend their JSX.IntrinsicElements the same way.
 *
 * // React 19 (13.5.0): per-tag attributes + typed `onusa:*` handlers, generated from the manifest:
 * import type { UsaReact19IntrinsicElements } from 'motionary/components/jsx';
 * declare module 'react' { namespace JSX { interface IntrinsicElements extends UsaReact19IntrinsicElements {} } }
 * ```
 * (React 19 + SSR: `onusa:*` props are not attached to hydrated elements — use a ref + `bindUsa`, see `motionary/components/react`.)
 */

type Tags = (typeof COMPONENT_CATEGORIES)[keyof typeof COMPONENT_CATEGORIES][number] | UsaElementTag;
/** Attributes accepted by every `<usa-*>` element (all component attributes are strings / booleans). */
interface UsaAttributes {
    [attr: string]: unknown;
    class?: string;
    className?: string;
    id?: string;
    style?: unknown;
    slot?: string;
    variant?: 'minimal' | 'neon' | 'glass' | 'brutalist' | 'fluent' | 'material' | (string & {});
    children?: unknown;
    ref?: unknown;
}
/** Documented attributes of tag `K` (13.5.0, generated from the manifest; `{}` for tags without documented attributes). */
type UsaTagAttributes<K extends string> = K extends keyof UsaElementAttributeMap ? UsaElementAttributeMap[K] : {};
/** Raw `<usa-*>` tags with their documented attributes (13.5.0: per-tag, generated). */
type UsaIntrinsicElements = {
    [K in Tags]: UsaAttributes & UsaTagAttributes<K>;
};

/**
 * Solid directive (`use:usa`). Solid calls it with the element and an
 * accessor; since 4.0.1 the binding is tracked with `createRenderEffect`, so
 * signals read inside `{{ props, on }}` update the element automatically and
 * the listeners are removed on cleanup. `refresh()` is kept for code that
 * calls the directive outside a reactive owner.
 */
declare function usa(el: HTMLElement, accessor: () => UsaBinding | undefined): {
    refresh(): void;
    destroy(): void;
};
/** Register the elements (all, or some categories) — call from `onMount` in SSR apps. */
declare function defineUsa(categories?: ComponentCategory[]): void;
/** JSX intrinsic elements for Solid (same attribute types as the React/Preact ones). */
type SolidUsaIntrinsicElements = UsaIntrinsicElements;

export { bindUsa, defineUsa, usa, usaEventName };
export type { SolidUsaIntrinsicElements, UsaBinding };
