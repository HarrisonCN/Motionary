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
 * use-scroll-animate/components/background — backgrounds & decoration.
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

export { configureComponents, defineAcrylic, defineAurora, defineBackgroundComponents, defineBlobs, defineDotNetwork, defineGrain, defineGridGlow, defineMarquee, defineParticles, defineWaterRipple, fluentPreset, prefersReducedMotion };
export type { ComponentsConfig, FluentPresetOptions, UsaAcrylicElement, UsaAuroraElement, UsaBlobsElement, UsaDotNetworkElement, UsaElement, UsaGrainElement, UsaGridGlowElement, UsaMarqueeElement, UsaParticlesElement, UsaWaterRippleElement };
