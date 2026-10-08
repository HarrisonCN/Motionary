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
 * use-scroll-animate/components/webgl — lightweight canvas / WebGL (v3.4).
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

export { GL_FALLBACKS, PARTICLE_PRESETS, POST_EFFECTS, SHADERS, configureComponents, defineDistort, defineLiquid, definePostFx, defineShader, defineWebglComponents, fragmentSource, glFallbackCss, glGovernor, glQuad, postFxShader, prefersReducedMotion, supportsWebGL, watchPowerSaver };
export type { ComponentsConfig, GLGovernor, GLGovernorOptions, GLQuad, ParticlePreset, PostEffect, UsaElement, UsaGLElement };
