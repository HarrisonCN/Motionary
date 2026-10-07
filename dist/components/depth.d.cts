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
 * use-scroll-animate/components/depth — 3D (v3.5).
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

export { configureComponents, defineCube, defineDepth, defineDepthComponents, deviceTilt, orientationToTilt, prefersReducedMotion, requestOrientationPermission, supportsOrientation };
export type { ComponentsConfig, TiltReading, UsaCubeElement, UsaDepthElement, UsaElement };
