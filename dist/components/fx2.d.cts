type MotionSensitivity = 'full' | 'gentle' | 'minimal' | 'static';
type Cleanup = () => void;

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
interface EffectContext {
    /** Reduced motion applies (OS setting, `minimal` / `static` sensitivity). */
    readonly reduced: boolean;
    readonly sensitivity: MotionSensitivity;
    /** The triggering event (pointer position for click effects), if any. */
    readonly event?: Event;
    /** `el.animate()` with the library's motion rules (may return `null`). */
    animate(el: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions): Animation | null;
    /** Register teardown for long-running effects (loops, listeners). */
    onCleanup(fn: Cleanup): void;
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
    run(el: HTMLElement, options: O, ctx: EffectContext): void | Cleanup | Animation | null | Promise<unknown>;
}

/**
 * 6.2 — GPU effect pack (`motionary/components/fx-gpu`), registered through
 * `registerEffect()`:
 *
 * - WebGL2 shaders with a Canvas 2D fallback (kind `background`): `fluid`
 *   (domain-warped fluid that swirls around the pointer), `smoke`, `fire`,
 *   `ink` (ink blooming in water), `fireflies`.
 * - Canvas 2D particles (kind `background`): `sakura` (falling cherry
 *   petals), `leaves` (tumbling autumn leaves).
 * - `splash` (kind `click`): droplets + a ring burst from the pointer.
 *
 * Every background renders only while visible, lowers its resolution when
 * frames are slow, and draws one static frame under reduced motion.
 */

declare const GPU_FX: EffectDefinition[];
/** Register the 6.2 GPU pack (idempotent). */
declare function registerGpuEffects(): void;

/**
 * 6.3 — Text effects 3.0 (`motionary/components/fx-text`), registered through
 * `registerEffect()`:
 *
 * - `liquid-text` (loop) — the text ripples like liquid (animated SVG
 *   turbulence + displacement filter).
 * - `neon-write` (text) — letters flicker on one by one like a neon sign
 *   being switched on, then keep a soft glow.
 * - `particle-text` (text) — particles fly in from around the element and
 *   assemble into the glyphs, then hand over to the real text.
 * - `glitch-text` (text) — RGB-split slices jump sideways for a moment.
 * - `text-trail` (cursor) — the letters of a word fall off the pointer.
 * - `font-breathe` (loop) — a variable-font weight wave breathes through the text.
 * - `flip-chars` (text) — every character flips up in 3D, staggered.
 *
 * Splitting keeps a visually hidden copy for screen readers (the animated
 * characters are `aria-hidden`). Reduced motion: loops and the trail are
 * skipped, one-shot effects show the final state without movement.
 */

/** Split `el`'s text into `aria-hidden` inline-block characters (idempotent). Returns them. */
declare function splitChars(el: HTMLElement): HTMLElement[];
declare const TEXT3_FX: EffectDefinition[];
/** Register the 6.3 text pack (idempotent). */
declare function registerTextEffects3(): void;

/**
 * 6.4 — Light & materials (`motionary/components/fx-light`), registered
 * through `registerEffect()`. Persistent effects (use `trigger="load"`)
 * that return a cleanup:
 *
 * - `light-follow` (hover) — a soft point light + specular highlight that
 *   follows the pointer over the surface.
 * - `refraction` (hover) — a glass lens that bends and magnifies what is
 *   behind it as it follows the pointer (backdrop filter, chromatic rim).
 * - `brushed-metal` (card) — fine brushed lines with an anisotropic sheen
 *   that turns with the pointer angle.
 * - `pearlescent` (card) — a nacre / holographic film whose hues shift with
 *   the pointer position.
 * - `god-rays` (background) — volumetric light shafts from a source point
 *   (Canvas 2D, additive).
 * - `pointer-shadow` (hover) — the pointer is the light: the element casts
 *   a soft real-time shadow away from it.
 *
 * Reduced motion: surfaces stay lit from a fixed angle (no tracking),
 * `god-rays` draws one still frame.
 */

/** Track the pointer over `el` as 0–1 coordinates (`fn(x, y, inside)`); starts at (`x0`, `y0`). Returns a remover. */
declare function trackPointer(el: HTMLElement, ctx: EffectContext, fn: (x: number, y: number, inside: boolean) => void, x0?: number, y0?: number): () => void;
declare const LIGHT_FX: EffectDefinition[];
/** Register the 6.4 light & materials pack (idempotent). */
declare function registerLightEffects(): void;

/**
 * 6.5 — 3D scene cards (`motionary/components/fx-3d`), registered through
 * `registerEffect()`:
 *
 * - `depth-stack` (card, persistent) — the children (or `[data-depth]`
 *   layers) separate in Z and parallax against each other as the card tilts
 *   toward the pointer.
 * - `product-spin` (card, persistent) — a 360° product viewer: drag to turn
 *   the element in 3D with inertia, idles with a slow turntable spin.
 * - `card-flip-3d` (click) — a thick card flips to its back face (second
 *   child) with an edge that shows its depth.
 * - `origami` (enter) — the element unfolds panel by panel like folded paper.
 * - `orbit-camera` (scroll, persistent) — while the element scrolls through
 *   the viewport the camera orbits its 3D children.
 *
 * Reduced motion: no tilt, spin, orbit or fold; the flip swaps faces with a
 * crossfade.
 */

declare const DEPTH3_FX: EffectDefinition[];
/** Register the 6.5 3D pack (idempotent). */
declare function register3dEffects(): void;

/**
 * 6.6 — Morph & SVG 2.0 (`motionary/components/fx-morph`), registered
 * through `registerEffect()`:
 *
 * - `path-morph` (loop) — an SVG `<path>` flows between shapes (`paths`, any
 *   number of `d` strings): both shapes are resampled to the same number of
 *   points, so paths with different commands still morph smoothly.
 * - `blob-button` (hover, persistent) — a liquid blob behind the element
 *   wobbles and bulges toward the pointer.
 * - `stroke-draw` (enter) — every stroke in an inline SVG draws itself,
 *   staggered, then the fills fade in.
 * - `noise-reveal` (enter) — the element condenses out of SVG turbulence
 *   (displacement + blur) — an SVG-filter transition.
 * - `icon-swap` (click) — cycles through the element's child icons with a
 *   gooey morph (blur + scale + rotate crossfade).
 *
 * Reduced motion: no loops / wobble; enter effects and swaps fade.
 */

/** Sample `d` into `n` points (needs SVG geometry support; `null` without it). */
declare function samplePath(d: string, n?: number): [number, number][] | null;
/** Points → closed path `d`. */
declare const pointsToPath: (pts: [number, number][]) => string;
declare const MORPH2_FX: EffectDefinition[];
/** Register the 6.6 morph & SVG pack (idempotent). */
declare function registerMorphEffects2(): void;

/**
 * 6.7 — Transitions 2.0 (`motionary/components/fx-transitions`), registered
 * through `registerEffect()` (kind `page`; option `mode: 'in' | 'out'`):
 *
 * - `ripple-dissolve` — a circle with a ripple ring grows from the pointer
 *   (or `x` / `y` 0–1) and reveals / hides the element.
 * - `shatter` — the element breaks into shards that fly apart (out) or
 *   fly together (in).
 * - `mosaic-flip` — a grid of tiles flips over in a diagonal wave.
 * - `liquid-wipe` — a wavy liquid edge sweeps across.
 * - `page-curl` — the element turns like a page around its left edge.
 * - `camera-dolly` — a dolly zoom: scale + depth blur + fade.
 *
 * `pageTransition(update, effect)` runs a DOM update inside the View
 * Transitions API (when available) and plays the effect on the new snapshot;
 * without the API it runs `update()` and plays the effect on `target`.
 * `crossDocumentTransitions(effect)` opts an MPA into cross-document view
 * transitions (`@view-transition { navigation: auto }`) with the same look.
 * Reduced motion: plain short fades.
 */

declare const TRANSITIONS2_FX: EffectDefinition[];
/**
 * Run `update` (a DOM change) as a transition: inside `document.startViewTransition`
 * when supported (the new snapshot plays `effect`), otherwise `update()` then the
 * effect on `target` (default `document.body`'s first element).
 */
declare function pageTransition(update: () => void | Promise<void>, effect?: string, options?: Record<string, unknown>, target?: HTMLElement): Promise<void>;
/** Opt a multi-page site into cross-document view transitions with an effect's look. Returns a remover. */
declare function crossDocumentTransitions(effect?: string, duration?: number): () => void;
/** Register the 6.7 transitions pack (idempotent). */
declare function registerTransitionEffects2(): void;

/**
 * 5.5 — generative backgrounds on Canvas 2D, registered through
 * `registerEffect()` (kind `background`): `flow-field`, `voronoi`,
 * `mesh-gradient`, `starfield`, `metaballs`, `contours`.
 *
 * Shared runner (`canvasBackground()`): a canvas behind the element's content
 * (`aria-hidden`, pointer-transparent), rendering only while visible
 * (IntersectionObserver) and the tab is shown, with adaptive quality — the
 * render scale drops when frames get slow and recovers when they are fast.
 * Reduced motion: one static frame, no loop.
 */

interface GenFrame {
    ctx: CanvasRenderingContext2D;
    /** CSS-pixel size of the canvas. */
    w: number;
    h: number;
    /** Seconds since start (0 for the static reduced-motion frame). */
    t: number;
    /** Render scale 0.35–1 (adaptive quality). */
    quality: number;
    /** Per-effect state, created by `init`. */
    state: any;
    /** Merged options. */
    o: any;
}
interface GenerativeSpec {
    init?: (w: number, h: number, o: any) => any;
    draw: (f: GenFrame) => void;
}

/**
 * 6.2 — tiny WebGL2 full-screen shader runner with a Canvas 2D fallback, shared
 * by the 6.x GPU effect packs. One canvas behind the element (aria-hidden,
 * pointer-transparent), renders only while visible and the tab is shown,
 * adaptive resolution, pointer uniform, and a static first frame under reduced
 * motion. No WebGL2 (or a lost context / compile error) → the Canvas 2D
 * `fallback` spec runs through `canvasBackground()` instead.
 * `el.dataset.usaBackend` tells which one is active: `webgl2` or `canvas`.
 */

/** GLSL shared by every shader: uniforms, hash, value noise, fbm. */
declare const GLSL_HEAD = "#version 300 es\nprecision highp float;\nuniform vec2 u_res;uniform float u_t;uniform vec3 u_c0,u_c1,u_c2;uniform vec2 u_ptr;uniform float u_speed,u_scale;\nout vec4 o;\nfloat h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}\nfloat fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}\n";
interface ShaderSpec {
    /** GLSL body of `main()`: `uv` (0–1), `p` (aspect-corrected, scaled), `t` (s × speed) are in scope; write `o`. */
    body: string;
    /** Canvas 2D fallback. */
    fallback: GenerativeSpec;
}
declare function supportsWebGL2(): boolean;
/**
 * Mount a shader background behind `el` (options: `colors` [3 hex], `speed`,
 * `scale`, `quality`, `backend` = `'auto' | 'webgl2' | 'canvas'`). Returns the cleanup.
 */
declare function shaderBackground(el: HTMLElement, fx: EffectContext, spec: ShaderSpec, o: any): () => void;
/**
 * Canvas 2D fallback for a scalar field: `color(x, y, t)` (x, y in 0–1)
 * returns `[r, g, b]` (0–255), sampled on a coarse grid and scaled up smoothly.
 */
declare function fieldFallback(color: (x: number, y: number, t: number, o: any) => [number, number, number], cell?: number): GenerativeSpec;

/**
 * The 6.x effect packs, one entry each (`motionary/components/fx-gpu`, …) so
 * their size budgets stay separate. This module (`registerFx2()`) registers
 * them all — used by dist/widgets.umd.js and the showcase.
 */

/** The 6.x effect packs by name. */
declare const FX2_PACKS: Record<string, EffectDefinition[]>;
/** Register every 6.x pack (idempotent). */
declare function registerFx2(): void;

export { DEPTH3_FX, FX2_PACKS, GLSL_HEAD, GPU_FX, LIGHT_FX, MORPH2_FX, TEXT3_FX, TRANSITIONS2_FX, crossDocumentTransitions, fieldFallback, pageTransition, pointsToPath, register3dEffects, registerFx2, registerGpuEffects, registerLightEffects, registerMorphEffects2, registerTextEffects3, registerTransitionEffects2, samplePath, shaderBackground, splitChars, supportsWebGL2, trackPointer };
export type { ShaderSpec };
