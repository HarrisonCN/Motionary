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
    /**
     * Motion-sensitivity level (v4.4), finer than reduced motion:
     * `'full'` (default) · `'gentle'` (no spins, zooms, skews or parallax —
     * translations and fades only, safe for vestibular disorders) ·
     * `'minimal'` (fades only; components use their reduced-motion variants) ·
     * `'static'` (no animation: every component shows its static alternative).
     * See `setMotionSensitivity()` in `use-scroll-animate/components/a11y`.
     */
    motionSensitivity?: MotionSensitivity;
}
type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
type MotionIntensity = 'off' | 'low' | 'normal' | 'high';
declare const MOTION_SCALE: Record<MotionIntensity, number>;
/** Change global component settings (call before `define*()` for `injectStyles`). */
declare function configureComponents(options: ComponentsConfig): void;
/** The current global motion intensity. */
declare function getMotionIntensity(): MotionIntensity;
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

declare const CURSOR_MODES: readonly ["dot", "trail", "magnetic", "glow"];
type CursorMode = (typeof CURSOR_MODES)[number];
/**
 * `<usa-cursor mode="dot | trail | magnetic | glow">` — a custom cursor for
 * the page (place it once, e.g. at the end of `<body>`).
 * - `dot` — a ring that follows with spring lag around the real pointer;
 * - `trail` — a comet tail of dots;
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

/**
 * Set the global motion intensity for every `<usa-*>` component:
 * `'off'` (like reduced motion), `'low'`, `'normal'` (default), `'high'`.
 * Sets `--usa-motion` and `data-usa-motion` on `<html>`; with `persist`
 * the choice is remembered (localStorage) and restored by `restoreMotionIntensity()`.
 */
declare function setMotionIntensity(level: MotionIntensity, persist?: boolean): void;
/** Re-apply a persisted intensity (call early on page load). Returns it. */
declare function restoreMotionIntensity(): MotionIntensity;
/**
 * `<usa-motion-switch>` — a segmented control letting users choose the
 * app's motion intensity (Off · Low · Normal · High), persisted.
 * `role="radiogroup"`; arrow keys move. Attributes: `labels` (comma list),
 * `label` ("Motion"). Events: `usa:change` (`{ level }`).
 */
interface UsaMotionSwitchElement extends UsaElement {
    value: MotionIntensity;
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
 * use-scroll-animate/components/page — page & app-wide effects (v2.7).
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

export { AMBIENT_EFFECTS, CURSOR_MODES, MOTION_SCALE, PAGE_EFFECTS, configureComponents, defineAmbient, defineAutoSkeleton, defineBackToTop, defineCursor, defineFullpage, defineLoadingBar, defineMotionSwitch, definePageComponents, defineSplash, enableMpaTransitions, getMotionIntensity, loadingBar, pageTransition, prefersReducedMotion, restoreMotionIntensity, scrollToTarget, setMotionIntensity, smoothScroll, supportsViewTransitions, themeTransition };
export type { AmbientEffect, ComponentsConfig, CursorMode, MotionIntensity, PageEffect, PageTransitionOptions, SmoothScrollOptions, UsaAmbientElement, UsaAutoSkeletonElement, UsaBackToTopElement, UsaCursorElement, UsaElement, UsaFullpageElement, UsaLoadingBarElement, UsaMotionSwitchElement, UsaSplashElement };
