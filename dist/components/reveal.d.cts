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

export { REVEAL_EFFECTS, defineReveal, defineRevealComponents, defineScrollProgress, defineScrolly, defineStagger, readScrollProgress, revealKeyframes };
export type { RevealEffect, UsaRevealElement, UsaScrollProgressElement, UsaScrollyElement, UsaStaggerElement };
