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
 * use-scroll-animate/components/svg — SVG animation (v3.3).
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

export { ANIM_ICONS, MASK_SHAPES, configureComponents, defineAnimIcon, defineDraw, defineMaskReveal, defineMorph, defineSvgComponents, drawLines, interpolatePath, morphTo, pathsCompatible, prefersReducedMotion };
export type { ComponentsConfig, MorphOptions, UsaAnimIconElement, UsaDrawElement, UsaElement, UsaMaskRevealElement, UsaMorphElement };
