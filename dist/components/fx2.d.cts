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

export { FX2_PACKS, GLSL_HEAD, GPU_FX, fieldFallback, registerFx2, registerGpuEffects, shaderBackground, supportsWebGL2 };
export type { ShaderSpec };
