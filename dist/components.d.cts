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
}
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
 * use-scroll-animate/components/reveal — entrance & scroll reveal components.
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
 * Attributes: `by` (`chars` | `words`, default `chars`), `effect`
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
 * use-scroll-animate/components/text — text effects.
 * `<usa-typewriter>`, `<usa-split-text>`, `<usa-scramble>`, `<usa-counter>`,
 * `<usa-shimmer-text>`, `<usa-text-rotate>`.
 */

/** Register every component of this category under its default tag. */
declare function defineTextComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
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
 * use-scroll-animate/components/interaction — micro-interactions.
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
 * Variants (`variant`): `fluent` (default — the WinUI / Windows 11
 * ProgressRing arc), `windows` (the Windows 10 boot "orbiting dots"),
 * `ring` (classic border spinner), `dots` (three bouncing dots / typing
 * indicator), `pulse` (expanding ripple), `bars` (equalizer).
 * Attributes: `size` (px, 32), `label` (accessible name, "Loading"),
 * `paused`. Colour follows `color` / `--usa-spinner-color`.
 * `role="progressbar"` without a value (indeterminate). Reduced motion:
 * a slow opacity pulse instead of movement.
 */
interface UsaSpinnerElement extends UsaElement {
    variant: SpinnerVariant;
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
 * Attributes: `variant` (`success` default, `error`, `warning`), `size`
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
 * use-scroll-animate/components/feedback — loading & feedback.
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
 * Attributes: `variant` (`acrylic` default | `mica`), `tint` (colour),
 * `tint-opacity` (0–1, 0.55), `blur` (px, 30), `shimmer`
 * (`hover` | `load` | `none`, default `none`). Falls back to a solid tint
 * without `backdrop-filter` and under `prefers-reduced-transparency` or
 * forced colours, like Windows does when transparency effects are off.
 */
type UsaAcrylicElement = UsaElement;
declare function defineAcrylic(tag?: string): CustomElementConstructor | undefined;

/**
 * use-scroll-animate/components/background — backgrounds & decoration.
 * `<usa-aurora>`, `<usa-particles>`, `<usa-grain>`, `<usa-marquee>`,
 * `<usa-acrylic>`.
 */

/** Register every component of this category under its default tag. */
declare function defineBackgroundComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
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
 * Attributes: `open` (reflects; set/remove to open/close), `variant`
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
 * `<usa-flip-list>` — animates its children to their new places whenever
 * they are added, removed or reordered (FLIP: transforms only). Works with
 * any rendering: plain DOM, React keyed lists, Vue `v-for`, Svelte `{#each}`.
 *
 * Attributes: `duration` (ms, 420), `easing`, `disabled`.
 * Method: `flip(mutate)` for explicit changes (also measures resizes).
 * Reduced motion: no animation.
 */
interface UsaFlipListElement extends UsaElement {
    flip(mutate: () => void | Promise<void>): Promise<void>;
}
declare function defineFlipList(tag?: string): CustomElementConstructor | undefined;

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
interface ConnectedOptions {
    duration?: number;
    easing?: string;
    /** Hide `from` while the animation runs (default true). */
    hideSource?: boolean;
}
/**
 * Connected (shared-element) animation, like WinUI's
 * `ConnectedAnimationService`: `to` flies from the position and size of
 * `from` into its own place (e.g. a thumbnail opening into a detail view).
 * Call it right after `to` is shown. Transforms only.
 */
declare function connectedAnimation(from: Element, to: HTMLElement, options?: ConnectedOptions): Promise<void>;

/**
 * use-scroll-animate/components/transitions — view & layout transitions.
 * `<usa-dialog>`, `<usa-accordion>`, `<usa-flip-list>`, `<usa-view-switch>`
 * and the `viewTransition()`, `flip()`, `connectedAnimation()` helpers.
 */

/** Register every component of this category under its default tag. */
declare function defineTransitionComponents(): void;
declare global {
    interface HTMLElementTagNameMap {
        'usa-dialog': UsaDialogElement;
        'usa-accordion': UsaAccordionElement;
        'usa-flip-list': UsaFlipListElement;
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
 * use-scroll-animate/components/physics — spring & bounce physics (v2.3).
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

/** The component categories and their default tags. */
declare const COMPONENT_CATEGORIES: {
    readonly reveal: readonly ["usa-reveal", "usa-stagger", "usa-scroll-progress", "usa-scrolly"];
    readonly text: readonly ["usa-typewriter", "usa-split-text", "usa-scramble", "usa-counter", "usa-shimmer-text", "usa-text-rotate"];
    readonly interaction: readonly ["usa-ripple", "usa-magnetic", "usa-tilt", "usa-spotlight", "usa-press", "usa-toggle"];
    readonly feedback: readonly ["usa-spinner", "usa-skeleton", "usa-progress", "usa-toaster", "usa-check"];
    readonly background: readonly ["usa-aurora", "usa-particles", "usa-grain", "usa-marquee", "usa-acrylic"];
    readonly transitions: readonly ["usa-dialog", "usa-accordion", "usa-flip-list", "usa-view-switch"];
    readonly physics: readonly ["usa-spring", "usa-draggable", "usa-overscroll"];
};
type ComponentCategory = keyof typeof COMPONENT_CATEGORIES;
/**
 * Register every `<usa-*>` component (or only the given categories).
 * Safe to call more than once and on the server (no-op without DOM).
 */
declare function defineComponents(categories?: ComponentCategory[]): void;

export { COMPONENT_CATEGORIES, REVEAL_EFFECTS, SPINNER_VARIANTS, SPRING_EFFECTS, SPRING_PRESETS, configureComponents, connectedAnimation, createSpring, defineAccordion, defineAcrylic, defineAurora, defineBackgroundComponents, defineCheck, defineComponents, defineCounter, defineDialog, defineDraggable, defineFeedbackComponents, defineFlipList, defineGrain, defineInteractionComponents, defineMagnetic, defineMarquee, defineOverscroll, defineParticles, definePhysicsComponents, definePress, defineProgress, defineReveal, defineRevealComponents, defineRipple, defineScramble, defineScrollProgress, defineScrolly, defineShimmerText, defineSkeleton, defineSpinner, defineSplitText, defineSpotlight, defineSpring, defineStagger, defineTextComponents, defineTextRotate, defineTilt, defineToaster, defineToggle, defineTransitionComponents, defineTypewriter, defineViewSwitch, easeOutExpo, flip, linearEasing, prefersReducedMotion, projectInertia, readScrollProgress, resolveSpring, revealKeyframes, rubberBand, scrambleFrame, snapTo, spring, springEasing, springEffectKeyframes, springSamples, stepSpring, supportsLinearEasing, toast, viewTransition };
export type { ComponentCategory, ComponentsConfig, ConnectedOptions, DialogVariant, FlipOptions, RevealEffect, SpinnerVariant, SpringConfig, SpringEffect, SpringInput, SpringPreset, SpringValue, SpringValueOptions, ToastHandle, ToastOptions, ToastType, UsaAccordionElement, UsaAcrylicElement, UsaAuroraElement, UsaCheckElement, UsaCounterElement, UsaDialogElement, UsaDraggableElement, UsaElement, UsaFlipListElement, UsaGrainElement, UsaMagneticElement, UsaMarqueeElement, UsaOverscrollElement, UsaParticlesElement, UsaPressElement, UsaProgressElement, UsaRevealElement, UsaRippleElement, UsaScrambleElement, UsaScrollProgressElement, UsaScrollyElement, UsaShimmerTextElement, UsaSkeletonElement, UsaSpinnerElement, UsaSplitTextElement, UsaSpotlightElement, UsaSpringElement, UsaStaggerElement, UsaTextRotateElement, UsaTiltElement, UsaToasterElement, UsaToggleElement, UsaTypewriterElement, UsaViewSwitchElement, ViewTransitionOptions };
