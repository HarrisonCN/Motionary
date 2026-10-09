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
 * 6.9 — effect marketplace manifest (`motionary/components/marketplace`).
 *
 * A third-party effect pack is an ES module that exports its effects (an
 * `EffectDefinition[]` as `effects` or `default`) plus a JSON manifest:
 *
 * ```json
 * { "format": "motionary/effect-pack", "version": 1,
 *   "name": "@acme/motion-snow", "packVersion": "1.2.0",
 *   "description": "Snow and frost effects", "license": "MIT",
 *   "author": "Acme", "entry": "./dist/index.js", "requires": ">=6.9",
 *   "effects": [{ "name": "frost", "kind": "background", "description": "…",
 *                 "defaults": { "speed": 1 } }] }
 * ```
 *
 * `packManifest()` writes one from your effects, `validateManifest()` checks
 * one (format, semver, unique kebab-case names, known kinds, effects match
 * the module), and `loadEffectPack()` imports a pack (URL or module),
 * validates it and registers its effects — refusing names that already
 * exist unless `override`.
 */

declare const EFFECT_PACK_FORMAT = "motionary/effect-pack";
interface EffectPackManifest {
    format: typeof EFFECT_PACK_FORMAT;
    version: 1;
    name: string;
    packVersion: string;
    description?: string;
    license?: string;
    author?: string;
    homepage?: string;
    entry?: string;
    requires?: string;
    keywords?: string[];
    effects: {
        name: string;
        kind: string;
        description?: string;
        defaults?: Record<string, unknown>;
    }[];
}
/** Build a manifest from an effect pack. */
declare function packManifest(name: string, packVersion: string, effects: EffectDefinition[], extra?: Partial<Omit<EffectPackManifest, 'format' | 'version' | 'name' | 'packVersion' | 'effects'>>): EffectPackManifest;
/** Check a manifest (and optionally the module's effects against it). */
declare function validateManifest(m: unknown, effects?: EffectDefinition[]): {
    ok: boolean;
    errors: string[];
};
/**
 * Import an effect pack (a URL / specifier, or an already imported module
 * with `effects` / `default` and `manifest`), validate and register it.
 * Returns the registered effect names.
 */
declare function loadEffectPack(src: string | {
    effects?: EffectDefinition[];
    default?: EffectDefinition[];
    manifest?: EffectPackManifest;
}, opts?: {
    manifest?: EffectPackManifest;
    override?: boolean;
}): Promise<string[]>;

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
declare function registerGpuPack(): void;

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
declare function registerTextPack(): void;

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
declare function registerLightPack(): void;

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
declare function register3dPack(): void;

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
declare function registerMorphPack(): void;

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
declare function registerTransitionsPack(): void;

/**
 * 6.8 — Weather & ambience (`motionary/components/fx-weather`), registered
 * through `registerEffect()` (kind `background`, Canvas 2D):
 *
 * - `rain-glass` — droplets sit on a window pane, grow, and run down leaving
 *   trails.
 * - `snowfall` — flakes drift down and pile up along the bottom edge.
 * - `lightning` — a safe storm: branching bolts at most once per `interval`
 *   (≥ 2.5 s, far below the WCAG 2.3.1 limit of 3 flashes / s), the sky glow
 *   is capped at 22 % brightness and there is no flash at all under reduced
 *   motion.
 * - `fog` — soft layered fog banks drifting at different speeds.
 * - `aurora-veil` — curtains of northern lights waving over a night sky.
 * - `day-cycle` — the sky moves through dawn, day, dusk and night with the sun
 *   and moon on an arc (`cycle` seconds, or a fixed `hour` 0–24).
 *
 * Every effect renders only while visible, adapts its quality and draws one
 * static frame under reduced motion.
 */

/** Sky colours (top, bottom) for an hour 0–24. */
declare function skyAt(hour: number): [string, string];
declare const WEATHER_FX: EffectDefinition[];
/** Register the 6.8 weather & ambience pack (idempotent). */
declare function registerWeatherPack(): void;

/**
 * 6.8 — Interactive physics 2.0 (`motionary/components/fx-physics`) on a tiny
 * Verlet integrator (`VerletWorld`), registered through `registerEffect()`:
 *
 * - `soft-body` (kind `hover`) — the element wobbles like jelly: pointer
 *   motion pushes a damped spring that squashes and skews it.
 * - `magnet` (kind `hover`) — the element's children are pulled toward the
 *   pointer on springs and settle back when it leaves.
 * - `cloth` (kind `background`) — a cloth hangs from the top edge and ripples
 *   when the pointer moves through it.
 * - `rope` (kind `background`) — a rope with a weight swings from the top;
 *   the pointer pushes it.
 * - `pinball` (kind `background`) — balls fall through round bumpers that
 *   light up on a hit; click to drop another ball.
 *
 * Canvas effects render only while visible; reduced motion draws one static
 * frame and the hover effects do nothing.
 */

interface VerletPoint {
    x: number;
    y: number;
    px: number;
    py: number;
    pinned: boolean;
}
/** A minimal Verlet world: points, distance sticks, gravity, damping. */
declare class VerletWorld {
    gravity: number;
    damping: number;
    iterations: number;
    points: VerletPoint[];
    sticks: [number, number, number][];
    constructor(gravity?: number, damping?: number, iterations?: number);
    add(x: number, y: number, pinned?: boolean): number;
    link(a: number, b: number, len?: number): void;
    step(dt: number, bounds?: {
        w: number;
        h: number;
    }): void;
    /** Push points within `r` px of (x, y) by (dx, dy). */
    push(x: number, y: number, dx: number, dy: number, r?: number): void;
}
declare const PHYSICS2_FX: EffectDefinition[];
/** Register the 6.8 physics 2.0 pack (idempotent). */
declare function registerPhysicsPack(): void;

/**
 * 6.9 — Focus & feedback (`motionary/components/fx-focus`), registered
 * through `registerEffect()`:
 *
 * - `focus-draw` (kind `attention`) — a rounded ring draws itself around the
 *   element, then fades (great on `focus`).
 * - `marching-ants` (kind `loop`) — a dashed selection border that marches
 *   (drop targets, selections).
 * - `success-check` (kind `click`) — a check mark draws over the element on a
 *   soft green disc, then fades away.
 * - `highlight-sweep` (kind `attention`) — a highlighter stroke sweeps
 *   behind the element's text.
 *
 * Overlays are SVG / spans marked `aria-hidden` and removed when done.
 * Reduced motion: a plain fade of the final state (marching-ants is static).
 */

declare const FOCUS_FX: EffectDefinition[];
/** Register the 6.9 focus & feedback pack (idempotent). */
declare function registerFocusPack(): void;

/**
 * 5.6 — sound-reactive effects (Web Audio).
 *
 * - `enableAudio(input)` — start analysing the microphone (`'mic'`), an
 *   `<audio>` / `<video>` element (or a selector for one) or a `MediaStream`.
 *   Browsers only allow an `AudioContext` to start inside a user gesture, so
 *   call it from a click handler (or use `<usa-audio>`, which renders the
 *   toggle button for you).
 * - Background effects (kind `background`, Canvas 2D through
 *   `canvasBackground()`): `spectrum-bars`, `pulse-ring`, `wave-ring`. Before
 *   audio is enabled they idle gently.
 * - Beat detection: `createBeatDetector()` (pure: energy → beat?), `onBeat(cb)`
 *   and `bindBeat(el, effect, options)`, which plays any registered effect on
 *   every beat. `<usa-audio>` does the same for `[data-usa-beat="effect"]`
 *   children and emits `usa-beat`.
 * - While audio runs, `--usa-audio-level` and `--usa-audio-bass` (0–1) are set
 *   on `<html>` for CSS-driven reactions.
 *
 * Reduced motion: the visual effects are skipped, beats play no effects and
 * the CSS variables stay at 0 — audio itself keeps playing.
 */

interface AudioSample {
    /** Overall loudness (RMS of the waveform), 0–1. */
    level: number;
    /** Low-frequency energy (first ~8 % of the spectrum), 0–1. */
    bass: number;
    /** Frequency bins, 0–255 each. */
    freq: Uint8Array;
    /** Time-domain waveform, 0–255 (128 = silence). */
    wave: Uint8Array;
}

/**
 * 7.1 — Music visualization (`motionary/fx/music`, also
 * `motionary/components/fx-music`), registered through `registerEffect()`.
 * Every effect reads the running analyser (`enableAudio()` / `<usa-audio>`);
 * without one it plays a gentle synthetic signal (`syntheticSample()`), so
 * the visuals work as decoration too.
 *
 * - `waveform-scope` (background) — an oscilloscope line of the waveform.
 * - `radial-spectrum` (background) — spectrum bars around a circle.
 * - `spectrum-mirror` (background) — mirrored bars with a reflection.
 * - `sound-particles` (background) — particles launched by the bass.
 * - `beat-bounce` (loop) — the element pumps with the bass.
 * - `vinyl-spin` (loop) — the element turns like a record; level speeds it.
 *
 * Reduced motion: backgrounds draw one static frame, loops do nothing.
 */

/** A smooth, deterministic fake analyser frame at time `t` (s). */
declare function syntheticSample(t: number, bins?: number): AudioSample;
/** The live analyser frame, or the synthetic one. */
declare const musicSample: (t: number) => AudioSample;
declare const MUSIC_FX: EffectDefinition[];
/** Register the 7.1 music visualization pack (idempotent). */
declare function registerMusicPack(): void;

/**
 * 7.2 — Data-viz motion (`motionary/fx/chart`, also
 * `motionary/components/fx-chart`): entrances for the charts you already
 * have (any SVG or HTML chart library), registered through `registerEffect()`:
 *
 * - `bars-grow` (enter) — bars (`[data-bar]`, `rect`, or the children) grow
 *   from the baseline in a stagger.
 * - `line-draw` (enter) — every SVG `path` / `polyline` / `line` draws itself.
 * - `ring-sweep` (enter) — SVG `circle` arcs sweep around from 12 o'clock.
 * - `sankey-flow` (loop) — dashes flow along the SVG links (`[data-flow]` or
 *   every stroked `path`) to show direction and volume.
 * - `number-roll` (enter) — numbers (`[data-value]` or the text) count up
 *   with locale formatting.
 * - `dots-pop` (enter) — scatter / line points (`circle`, `[data-dot]`) pop in.
 *
 * Reduced motion: final state with a short fade (sankey-flow is static).
 */

/** Parse a number out of text like "$1,234.5k" → { n, pre, post, dec }. */
declare function parseFigure(s: string): {
    n: number;
    pre: string;
    post: string;
    dec: number;
} | null;
declare const CHART_FX: EffectDefinition[];
/** Register the 7.2 data-viz motion pack (idempotent). */
declare function registerChartPack(): void;

/**
 * 7.3 — E-commerce motion (`motionary/fx/shop`, also
 * `motionary/components/fx-shop`):
 *
 * - `fly-to-cart` (click) — a ghost of the element (or its first `img`) flies
 *   on an arc into the cart (`to`, default `[data-cart]`), shrinking; the cart
 *   bumps when it lands.
 * - `price-flip` (enter) — the price flips like a split-flap display from
 *   `data-from` (or a scramble) to its text.
 * - `stock-pulse` (loop) — a soft urgency pulse (glow ring) for low stock.
 * - `sale-shine` (hover) — a diagonal light sweep across the element.
 * - `badge-pop` (attention) — a sale badge pops in with a wobble.
 *
 * Reduced motion: fly-to-cart only bumps the cart with a fade, price-flip
 * sets the text, stock-pulse and sale-shine do nothing, badge-pop fades.
 */

/** Quadratic-bezier arc points from a to b, lifted by `lift` px (7.3). */
declare function arcPath(ax: number, ay: number, bx: number, by: number, lift?: number, steps?: number): {
    x: number;
    y: number;
}[];
declare const SHOP_FX: EffectDefinition[];
/** Register the 7.3 e-commerce pack (idempotent). */
declare function registerShopPack(): void;

/**
 * 7.4 — Chat & social motion (`motionary/fx/social`, also
 * `motionary/components/fx-social`):
 *
 * - `typing-dots` (loop) — three dots bounce in a wave inside the element.
 * - `message-in` (enter) — a chat bubble pops in from its side (`side`
 *   "left" | "right", or `data-side`), with a little overshoot.
 * - `reaction-burst` (click) — the element's emoji (`emoji`) floats up in a
 *   small fan and fades.
 * - `read-receipt` (enter) — ✓✓ ticks draw in and turn blue (`color`).
 * - `mention-glow` (attention) — a soft highlight sweeps behind an @mention.
 *
 * Reduced motion: typing-dots shows static dots, message-in / read-receipt
 * fade, reaction-burst does nothing, mention-glow sets a static highlight.
 */

/** Fan-out angles (deg) for `n` floating emoji, centred on straight up (7.4). */
declare function fanAngles(n: number, spread?: number): number[];
declare const SOCIAL_FX: EffectDefinition[];
/** Register the 7.4 chat & social pack (idempotent). */
declare function registerSocialPack(): void;

/**
 * 7.5 — Gamification motion (`motionary/fx/game`, also
 * `motionary/components/fx-game`):
 *
 * - `achievement-unlock` (attention) — the element slides in, a light sweep
 *   crosses it and its icon (`[data-icon]` or first child) pops.
 * - `level-up` (attention) — a scale-up with a ring shockwave.
 * - `chest-open` (click) — the lid (`[data-lid]` or first child) flips open
 *   and sparks fly out.
 * - `coin-burst` (click) — coins (`coin`, default 🪙) arc up and fall.
 * - `xp-gain` (enter) — a “+50 XP” label (`text` or `data-xp`) floats up and
 *   fades.
 *
 * Reduced motion: unlock / level-up fade, chest-open sets the lid open,
 * coin-burst and xp-gain do nothing.
 */

/** Ballistic keyframe points for a coin thrown at `deg` with `power` (7.5). */
declare function throwPath(deg: number, power?: number, steps?: number, g?: number): {
    x: number;
    y: number;
}[];
declare const GAME_FX: EffectDefinition[];
/** Register the 7.5 gamification pack (idempotent). */
declare function registerGamePack(): void;

/**
 * 7.6 — Maps & geo motion (`motionary/fx/geo`, also `motionary/components/fx-geo`):
 *
 * - `route-draw` (enter) — every SVG `path` / `polyline` inside the element
 *   (or `[data-route]` only, when present) draws itself along its length,
 *   one after another (`duration`, `stagger`).
 * - `marker-pulse` (attention) — rings expand out of the element like a
 *   location beacon (`color`, `rings`).
 * - `pin-drop` (enter) — the element drops onto its spot with a squash and a
 *   landing shadow (`height`).
 * - `globe-spin` (enter) — the element turns in like a globe coming round
 *   (rotateY with perspective) (`turns`).
 *
 * Reduced motion: route-draw shows the routes, marker-pulse does nothing,
 * pin-drop and globe-spin fade in.
 */

/** Length of a polyline through `points` (7.6). */
declare function routeLength(points: {
    x: number;
    y: number;
}[]): number;
declare const GEO_FX: EffectDefinition[];
/** Register route-draw, marker-pulse, pin-drop and globe-spin (7.6). */
declare function registerGeoPack(): void;

/**
 * 7.7 — Form motion (`motionary/fx/form`, also `motionary/components/fx-form`):
 *
 * - `field-shake` (attention) — the element shakes sideways with a red
 *   outline flash, the classic "invalid" cue (`distance`, `color`).
 * - `field-success` (attention) — a green glow pulses round the element and a
 *   small check badge pops on its corner (`color`).
 * - `label-float` (enter) — every `label` (or `[data-label]`) inside rises and
 *   settles, one after another, like floating labels (`stagger`).
 * - `form-cascade` (enter) — the element's children (fields, buttons) slide
 *   in one after another (`stagger`, `distance`).
 *
 * Reduced motion: field-shake / field-success only flash the outline colour,
 * label-float and form-cascade fade in.
 */

/** Decaying sideways shake keyframes (7.7). */
declare function shakeFrames(distance?: number, steps?: number): Keyframe[];
declare const FORM_FX: EffectDefinition[];
/** Register field-shake, field-success, label-float and form-cascade (7.7). */
declare function registerFormPack(): void;

/**
 * 7.8 — AI UI motion (`motionary/fx/ai`, also `motionary/components/fx-ai`):
 *
 * - `stream-text` (enter) — the element's text appears word by word, like a
 *   streamed LLM reply, with a blinking caret at the end (`speed` ms/word).
 * - `thinking-glow` (loop) — a soft colour glow breathes and drifts round the
 *   element while a model is "thinking" (`colors`); the cleanup stops it.
 * - `voice-wave` (attention) — the element's children bounce in a wave like
 *   voice level bars (or the element pulses when it has none) (`cycles`).
 * - `gen-skeleton` (enter) — a shimmering skeleton covers the element, then
 *   dissolves to reveal the generated content (`hold`).
 *
 * Reduced motion: stream-text shows the text, thinking-glow is skipped,
 * voice-wave does nothing, gen-skeleton fades in.
 */

/** Split text into words, keeping the whitespace after each (7.8). */
declare function splitWords(text: string): string[];
declare const AI_FX: EffectDefinition[];
/** Register stream-text, thinking-glow, voice-wave and gen-skeleton (7.8). */
declare function registerAiPack(): void;

/**
 * 8.1 — Festival packs (`motionary/fx/festival`, also `motionary/components/fx-festival`):
 *
 * - `firework-burst` (attention) — rockets of sparks burst out of the element
 *   in festive colours (`bursts`, `colors`).
 * - `lantern-rise` (enter) — the element floats up and sways in like a
 *   Lunar New Year lantern (`sway`).
 * - `xmas-snow` (loop) — snowflakes drift down over the element; the cleanup
 *   stops them (`flakes`).
 * - `spooky-float` (attention) — the element wobbles and fades like a
 *   Halloween ghost (`cycles`).
 *
 * Reduced motion: firework-burst / spooky-float do nothing, xmas-snow is
 * skipped, lantern-rise fades in. Particles are `aria-hidden` and removed.
 */

/** Evenly spread spark directions with a little jitter (8.1). */
declare function sparkVectors(n: number, radius: number, seed?: number): {
    x: number;
    y: number;
}[];
declare const FESTIVAL_FX: EffectDefinition[];
/** Register firework-burst, lantern-rise, xmas-snow and spooky-float (8.1). */
declare function registerFestivalPack(): void;

/**
 * 8.2 — Retro pack (`motionary/fx/retro`, also `motionary/components/fx-retro`):
 *
 * - `pixelate-in` (enter) — the element resolves from big blocky pixels to
 *   sharp, like an 8-bit sprite loading (`steps`).
 * - `crt-power` (enter) — a CRT switching on: a bright line opens into the
 *   picture with a flash (`duration`).
 * - `vhs-glitch` (attention) — VHS tracking jitter with an RGB split and a
 *   noise band (`intensity`).
 * - `y2k-shine` (attention) — a chrome Y2K highlight sweeps across the
 *   element with a little bounce (`color`).
 *
 * Reduced motion: pixelate-in / crt-power fade in, vhs-glitch does nothing,
 * y2k-shine is a short brightness flash.
 */

/** Keyframes stepping a CSS blur/contrast "pixel" filter from coarse to sharp (8.2). */
declare function pixelSteps(steps?: number): Keyframe[];
declare const RETRO_FX: EffectDefinition[];
/** Register pixelate-in, crt-power, vhs-glitch and y2k-shine (8.2). */
declare function registerRetroPack(): void;

/**
 * 8.3 — Organic pack (`motionary/fx/organic`, also `motionary/components/fx-organic`):
 *
 * - `vine-grow` (enter) — SVG paths inside grow along their length like a
 *   vine and `[data-leaf]` / circles pop in along the way (`duration`).
 * - `bloom` (enter) — the element's children unfold from the centre like
 *   petals (or the element itself blooms open) (`stagger`).
 * - `water-drop` (attention) — the element dips like a drop hit water and
 *   concentric ripples spread out (`rings`, `color`).
 * - `breathe` (loop) — a slow organic morph of shape and scale, like a
 *   living blob; the cleanup stops it (`duration`).
 *
 * Reduced motion: vine-grow shows the vine, bloom fades in, water-drop does
 * nothing, breathe is skipped.
 */

/** A blob border-radius ("63% 37% 54% 46% / 55% 48% 52% 45%") from a seed (8.3). */
declare function blobRadius(seed: number): string;
declare const ORGANIC_FX: EffectDefinition[];
/** Register vine-grow, bloom, water-drop and breathe (8.3). */
declare function registerOrganicPack(): void;

/**
 * 8.4 — Cyber / sci-fi pack (`motionary/fx/cyber`, also `motionary/components/fx-cyber`):
 *
 * - `hud-frame` (enter) — corner brackets draw in around the element and a
 *   scan bar sweeps across it, like a HUD locking on (`color`).
 * - `scanline-sweep` (attention) — a bright horizontal scanline runs down
 *   the element (`color`, `passes`).
 * - `hologram` (loop) — a flickering, translucent cyan hologram look with
 *   drifting scan bands; the cleanup restores the element (`color`).
 * - `data-decode` (enter) — the text resolves from random glyphs to the real
 *   characters, left to right (`speed`).
 *
 * Reduced motion: hud-frame / data-decode just show, scanline-sweep does
 * nothing, hologram is skipped. Overlays are `aria-hidden` and removed.
 */

/** The `k`-th frame of decoding `text` over `n` frames: resolved prefix + random glyphs (8.4). */
declare function decodeFrame(text: string, k: number, n: number, rnd?: () => number): string;
declare const CYBER_FX: EffectDefinition[];
/** Register hud-frame, scanline-sweep, hologram and data-decode (8.4). */
declare function registerCyberPack(): void;

/**
 * 8.5 — Paper & hand-drawn pack (`motionary/fx/paper`, also `motionary/components/fx-paper`):
 *
 * - `paper-unfold` (enter) — the element unfolds like a folded sheet of paper,
 *   top flap first, with a soft crease shadow (`folds`).
 * - `pencil-sketch` (enter) — SVG strokes inside are sketched in with a
 *   slightly wobbly pencil, one after another (`duration`, `stagger`).
 * - `watercolor` (enter) — the element bleeds in like wet watercolour:
 *   blurred, saturated, spreading from the middle, then dries (`duration`).
 * - `crumple` (attention) — the element scrunches like crumpled paper and
 *   springs back flat.
 *
 * Reduced motion: paper-unfold / watercolor fade in, pencil-sketch shows the
 * drawing, crumple does nothing.
 */

/** A deterministic PRNG in [0, 1) from a seed (8.5). */
declare function paperRandom(seed: number): () => number;
/** A hand-drawn SVG path from (x1,y1) to (x2,y2): a slightly bowed, wobbly line (8.5). */
declare function roughLine(x1: number, y1: number, x2: number, y2: number, seed?: number, amp?: number): string;
declare const PAPER_FX: EffectDefinition[];
/** Register paper-unfold, pencil-sketch, watercolor and crumple (8.5). */
declare function registerPaperPack(): void;

/**
 * 8.6 — Surface theme pack (`motionary/fx/surface`, also `motionary/components/fx-surface`):
 *
 * - `neon-ignite` (enter) — the element powers on like a neon tube: a few
 *   stuttering flickers, then a steady glow (`color`).
 * - `neon-pulse` (loop) — a slow breathing neon glow; the cleanup stops it
 *   (`color`).
 * - `glass-frost` (enter) — frosted glass condenses: blur and transparency
 *   settle into a crisp glass panel, with a shine passing over it.
 * - `neu-press` (attention) — a soft neumorphic press: the raised shadow
 *   flips to an inset one and pops back.
 *
 * Reduced motion: neon-ignite / glass-frost just show, neon-pulse is
 * skipped, neu-press does nothing.
 */

/** The built-in surface themes of the 8.6 theme system. */
declare const SURFACE_THEMES: readonly ["light", "dark", "neon", "glass", "neu"];
type SurfaceTheme = (typeof SURFACE_THEMES)[number];
/** Set `data-usa-surface` on `target` (default `<html>`) and return the theme actually applied (unknown → `light`) (8.6). */
declare function applySurfaceTheme(name: string, target?: Element | null): SurfaceTheme;
declare const SURFACE_FX: EffectDefinition[];
/** Register neon-ignite, neon-pulse, glass-frost and neu-press (8.6). */
declare function registerSurfacePack(): void;

/**
 * 8.7 — Gestures 3.0 pack (`motionary/fx/gesture`, also `motionary/components/fx-gesture`):
 *
 * - `swipe-hint` (attention) — a ghost fingertip swipes across the element
 *   and the element nudges along, teaching "swipe me" (`direction` left|right).
 * - `pinch-hint` (attention) — two ghost fingertips pinch out and the
 *   element zooms with them, teaching "pinch to zoom".
 * - `tilt-wobble` (attention) — a 3D wobble as if the phone was tilted.
 * - `depth-in` (enter) — children fly in from different depths (by
 *   `data-depth`, default their order), like parallax layers settling.
 *
 * Reduced motion: depth-in just shows, the hints and wobble do nothing.
 */

type Pt = {
    x: number;
    y: number;
};
/** Scale factor of a two-finger pinch from start points (a1, a2) to current points (b1, b2) (8.7). */
declare function pinchScale(a1: Pt, a2: Pt, b1: Pt, b2: Pt): number;
/** Rotation in degrees of a two-finger twist from (a1, a2) to (b1, b2) (8.7). */
declare function pinchAngle(a1: Pt, a2: Pt, b1: Pt, b2: Pt): number;
/** Device orientation (beta front/back, gamma left/right, in degrees) → card tilt { rx, ry } clamped to ±max (8.7). */
declare function orientationToTilt(beta: number, gamma: number, max?: number, rest?: number): {
    rx: number;
    ry: number;
};
declare const GESTURE3_FX: EffectDefinition[];
/** Register swipe-hint, pinch-hint, tilt-wobble and depth-in (8.7). */
declare function registerGesture3Pack(): void;

/**
 * 8.8 — XR / spatial pack (`motionary/fx/spatial`, also `motionary/components/fx-spatial`):
 *
 * - `portal-open` (enter) — the element opens like a portal: a ring of
 *   light expands and the content comes through from depth (`color`).
 * - `orbit-in` (enter) — the element swings in around the vertical axis
 *   like a spatial window placed beside you (`from` left|right).
 * - `spatial-float` (loop) — a gentle floating in depth with a breathing
 *   shadow; the cleanup stops it.
 * - `depth-pop` (attention) — the element pops forward towards the viewer
 *   and settles back.
 *
 * Reduced motion: portal-open / orbit-in just show, spatial-float is
 * skipped, depth-pop does nothing.
 */

/** Horizontal background offset (px) of a 360° panorama `width` px wide for a `yaw` in degrees (wraps) (8.8). */
declare function yawToOffset(yaw: number, width: number): number;
/** Which WebXR session the browser offers: `'immersive-vr'`, `'immersive-ar'`, `'inline'` or `'none'` (8.8). */
declare function xrSupport(): Promise<'immersive-vr' | 'immersive-ar' | 'inline' | 'none'>;
declare const SPATIAL_FX: EffectDefinition[];
/** Register portal-open, orbit-in, spatial-float and depth-pop (8.8). */
declare function registerSpatialPack(): void;

/**
 * 9.1 — Cinematic pack (`motionary/fx/cinema`, also `motionary/components/fx-cinema`):
 *
 * - `dolly-in` (enter) — a slow camera push: the element starts slightly
 *   large and soft and settles sharp, like a dolly shot (`duration`).
 * - `pan-reveal` (enter) — the camera pans across the element while a
 *   wipe uncovers it (`from` left|right).
 * - `letterbox` (enter) — cinema bars slide in, hold, then open up to
 *   reveal the element (`hold`).
 * - `rack-focus` (attention) — focus pulls from the element's first child
 *   to the rest and back, like a focus puller racking between subjects.
 *
 * `cameraFrame(move, p)` gives the transform of a camera move at progress
 * 0–1 (used by `<usa-scene>`). Reduced motion: entrances fade, rack-focus
 * does nothing.
 */

declare const CAMERA_MOVES: readonly ["dolly-in", "dolly-out", "pan-left", "pan-right", "tilt-up", "tilt-down", "zoom-in", "zoom-out", "orbit"];
/** Transform of camera `move` at progress `p` (0–1, clamped), `strength` 0–2 (9.1). */
declare function cameraFrame(move: string, p: number, strength?: number): string;
declare const CINEMA_FX: EffectDefinition[];
/** Register dolly-in, pan-reveal, letterbox and rack-focus (9.1). */
declare function registerCinemaPack(): void;

/**
 * 9.2 — Lottie import (`motionary/fx/lottie`, also `motionary/components/fx-lottie`).
 *
 * `lottieToKeyframes(json)` converts the layer transforms of a Lottie
 * (bodymovin) JSON — position `p`, scale `s`, rotation `r`, opacity `o`
 * (static or keyframed) — into WAAPI keyframes per layer plus the duration
 * (`op − ip` frames at `fr` fps), so a designer's After Effects motion runs
 * on Motionary's clock without lottie-web. `lottieToSvg(json)` renders the
 * simple vector shapes (ellipse `el`, rect `rc`, path `sh`, fill `fl`,
 * stroke `st`) as SVG groups, one per layer. `riveInputs(instance, el, map)`
 * wires Motionary-style triggers (hover / press / click / enter) to the
 * boolean / trigger inputs of a Rive state machine you created with the
 * Rive runtime.
 *
 * Effects: `lottie-play` (attention) plays the keyframes stored on an
 * element by `<usa-lottie>`; `icon-pop` (click) a sticker-like pop with a
 * ring burst for icons. Reduced motion: no motion.
 */

interface LottieLayerMotion {
    name: string;
    index: number;
    keyframes: Keyframe[];
    anchor: [number, number];
}
interface LottieMotion {
    width: number;
    height: number;
    duration: number;
    layers: LottieLayerMotion[];
}
/** Lottie JSON → WAAPI keyframes per layer + duration (ms) (9.2). */
declare function lottieToKeyframes(json: any): LottieMotion;
/** Render the simple vector layers of a Lottie JSON as an SVG string (one `<g data-layer>` per layer, top layer last) (9.2). */
declare function lottieToSvg(json: any): string;
/** Wire hover / press / click / enter on `el` to a Rive state machine's inputs: map { hover: 'isHover', click: 'fire' } (9.2). */
declare function riveInputs(instance: {
    stateMachineInputs(sm: string): any[];
}, stateMachine: string, el: HTMLElement, map: Partial<Record<'hover' | 'press' | 'click' | 'enter', string>>): () => void;
declare const LOTTIE_FX: EffectDefinition[];
/** Register lottie-play and icon-pop (9.2). */
declare function registerLottiePack(): void;

/**
 * 9.3 — Generative art 2.0 pack (`motionary/fx/genart`, also `motionary/components/fx-genart`):
 *
 * - `halftone-in` (enter) — the element prints in through a growing
 *   halftone dot screen, like a comic-book plate (`dot`).
 * - `mesh-drift` (loop) — a seeded mesh-gradient background that slowly
 *   drifts (`seed`, `palette`).
 * - `kaleido` (loop) — a kaleidoscopic conic overlay that turns slowly
 *   (`color`, `segments`).
 * - `grain-flicker` (loop) — animated film grain over the element.
 *
 * `PALETTES`, `seededRandom(seed)`, `meshGradient(seed, palette)` (a CSS
 * background string) are shared with `<usa-bg-generator>` and
 * `<usa-gen-art>`. Reduced motion: halftone-in fades, loops are skipped.
 */

declare const PALETTES: Record<string, string[]>;
/** Deterministic PRNG in [0, 1) (mulberry32) (9.3). */
declare function seededRandom(seed: number): () => number;
/** A seeded mesh-gradient CSS background (4 radial blobs over a base colour) (9.3). */
declare function meshGradient(seed?: number, palette?: string | string[]): string;
declare const GENART_FX: EffectDefinition[];
/** Register halftone-in, mesh-drift, kaleido and grain-flicker (9.3). */
declare function registerGenArtPack(): void;

/**
 * 9.4 — Video motion (`motionary/fx/video`, also `motionary/components/fx-video`):
 *
 * - `scrubVideo(video, trigger?)` — scroll-driven video: `currentTime`
 *   follows the scroll progress of `trigger` (default the video) through the
 *   viewport, eased. Returns a stop function.
 * - `frameSequence(canvas, { count, src | draw }, trigger?)` — an Apple-style
 *   image sequence scrubbed by scroll: frame `i` is the image `src(i)`
 *   (preloaded) or whatever `draw(ctx, i, w, h)` paints. Returns a stop.
 * - `scrollProgress(el)` — 0 when `el` enters at the bottom, 1 when it leaves
 *   at the top.
 *
 * Effects: `film-burn` (enter) — a warm light leak burns across as the
 * element appears; `jump-cut` (attention) — two hard cuts (zoom / reframe)
 * and back, like an edit. Reduced motion: scrubbing shows the first frame,
 * film-burn fades, jump-cut does nothing.
 */

/** Scroll progress of `el` through the viewport: 0 entering at the bottom → 1 leaving at the top (9.4). */
declare function scrollProgress(el: Element): number;
/** Scroll-driven video: `video.currentTime` follows the scroll progress of `trigger` (9.4). */
declare function scrubVideo(video: HTMLVideoElement, trigger?: Element, opts?: {
    ease?: number;
}): () => void;
interface FrameSequenceSource {
    count: number;
    src?: (i: number) => string;
    draw?: (ctx: CanvasRenderingContext2D, i: number, w: number, h: number) => void;
}
/** Image-sequence scrubbing on a canvas (preloads `src(i)`, or paints with `draw`) (9.4). */
declare function frameSequence(canvas: HTMLCanvasElement, seq: FrameSequenceSource, trigger?: Element): () => void;
declare const VIDEO_FX: EffectDefinition[];
/** Register film-burn and jump-cut (9.4). */
declare function registerVideoPack(): void;

/**
 * 9.5 — Accessible motion 2.0 (`motionary/fx/safe`, also `motionary/components/fx-safe`):
 *
 * - `vestibularSafe(keyframes)` — strips movement (translate / scale /
 *   rotate / skew / perspective, clip and blur) from keyframes, keeping
 *   opacity and colour, so any animation can get a vestibular-safe twin.
 * - `flashCount(keyframes, duration)` / `isFlashSafe(...)` — counts large
 *   opacity / brightness swings and checks WCAG 2.3.1's three-flashes-per-
 *   second limit.
 * - `applyMotionPreferences(prefs)` / `loadMotionPreferences()` — the
 *   settings behind `<usa-motion-prefs>`: sensitivity level, speed (shared
 *   clock rate), pause autoplay, no parallax; persisted in localStorage and
 *   exposed as `data-usa-*` attributes on `<html>` for your CSS.
 *
 * Effects that never move anything: `safe-fade` (enter), `focus-glow`
 * (attention), `color-pulse` (attention), `underline-sweep` (hover).
 */

/** Keyframes with all movement removed (opacity / colour / shadow kept; blur removed from filters) (9.5). */
declare function vestibularSafe(frames: Keyframe[]): Keyframe[];
/** Number of flashes (a ≥ 0.3 luminance swing that comes back) in one run of `frames` (9.5). */
declare function flashCount(frames: Keyframe[]): number;
/** WCAG 2.3.1: no more than three flashes in any one second (9.5). */
declare function isFlashSafe(frames: Keyframe[], duration: number, iterations?: number): boolean;
interface MotionPreferences {
    sensitivity: MotionSensitivity;
    speed: number;
    pauseAutoplay: boolean;
    noParallax: boolean;
}
declare const MOTION_PREFS_KEY = "usa-motion-prefs";
declare const DEFAULT_MOTION_PREFS: MotionPreferences;
/** Apply (and persist) motion preferences: sensitivity, shared clock speed, `data-usa-*` flags on `<html>` (9.5). */
declare function applyMotionPreferences(p: Partial<MotionPreferences>, persist?: boolean): MotionPreferences;
/** Saved preferences (or the defaults) (9.5). */
declare function loadMotionPreferences(): MotionPreferences;
declare const SAFE_FX: EffectDefinition[];
/** Register safe-fade, focus-glow, color-pulse and underline-sweep (9.5). */
declare function registerSafePack(): void;

/**
 * 9.6 — Performance 3.0 (`motionary/fx/perf`, also `motionary/components/fx-perf`):
 *
 * - `runInWorker(fn, ...args)` — run a pure function in a throw-away Web
 *   Worker (built from its source) and get a promise of its result; runs
 *   inline when Workers are unavailable.
 * - `offscreenRender(canvas, program, options)` — move a canvas animation
 *   off the main thread: `program` is the source of
 *   `function (ctx, t, w, h, state) {…}`; with OffscreenCanvas + Worker it
 *   runs in a worker (`backend: 'worker'`), otherwise on the main thread via
 *   the shared frame loop (`'main'`). Returns { backend, stop, resize }.
 * - `fpsMeter()` — a rolling frames-per-second meter on the shared loop.
 *
 * Effects: `idle-reveal` (enter) waits for an idle moment before fading in
 * (keeps first paint / input snappy); `gpu-lift` (hover) a compositor-only
 * lift (transform + opacity only). Reduced motion: idle-reveal just shows,
 * gpu-lift does nothing.
 */

/** Run a pure function in a Web Worker; resolves with its (structured-cloneable) result (9.6). */
declare function runInWorker<A extends unknown[], R>(fn: (...args: A) => R | Promise<R>, ...args: A): Promise<R>;
type DrawProgram = string | ((ctx: CanvasRenderingContext2D, t: number, w: number, h: number, state: Record<string, unknown>) => void);
/** Animate `canvas` with `program` in a worker (OffscreenCanvas) when possible, else on the main thread (9.6). */
declare function offscreenRender(canvas: HTMLCanvasElement, program: DrawProgram, opts?: {
    worker?: boolean;
    paused?: boolean;
}): {
    backend: 'worker' | 'main' | 'none';
    stop(): void;
    resize(w: number, h: number): void;
};
/** A rolling FPS meter on the shared frame loop: { fps, stop } (fps updates every frame) (9.6). */
declare function fpsMeter(window?: number): {
    readonly fps: number;
    readonly samples: number[];
    stop(): void;
};
declare const PERF3_FX: EffectDefinition[];
/** Register idle-reveal and gpu-lift (9.6). */
declare function registerPerf3Pack(): void;

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
    /** 7.0: hand-written WGSL statements for the WebGPU backend (default: `glslToWgsl(body)`). */
    wgsl?: string;
    /** GLSL body of `main()`: `uv` (0–1), `p` (aspect-corrected, scaled), `t` (s × speed) are in scope; write `o`. */
    body: string;
    /** Canvas 2D fallback. */
    fallback: GenerativeSpec;
}
declare function supportsWebGL2(): boolean;
/**
 * Mount a shader background behind `el` (options: `colors` [3 hex], `speed`,
 * `scale`, `quality`, `backend` = `'auto' | 'webgpu' | 'webgl2' | 'canvas'`).
 * 7.0: `auto` tries WebGPU first, then WebGL2, then Canvas 2D
 * (`el.dataset.usaBackend` names the one running). Returns the cleanup.
 */
declare function shaderBackground(el: HTMLElement, fx: EffectContext, spec: ShaderSpec, o: any): () => void;
/**
 * Canvas 2D fallback for a scalar field: `color(x, y, t)` (x, y in 0–1)
 * returns `[r, g, b]` (0–255), sampled on a coarse grid and scaled up smoothly.
 */
declare function fieldFallback(color: (x: number, y: number, t: number, o: any) => [number, number, number], cell?: number): GenerativeSpec;

/**
 * 7.0 — WebGPU backend for the shader backgrounds (`shaderBackground()`).
 *
 * Every 6.x shader is written once as a small GLSL `main()` body. 7.0 runs it
 * on **WebGPU** where the browser has it: `glslToWgsl()` translates the body
 * (types, constructors, literals, loops, uniforms) into a WGSL fragment
 * shader with the same noise helpers; a spec can also ship hand-written
 * `wgsl`. If WebGPU is missing, the adapter / device is refused, or the
 * shader does not compile, the effect falls back to **WebGL2**, then to the
 * Canvas 2D fallback — `el.dataset.usaBackend` says which one runs.
 */

/** WGSL shared by every shader: uniforms, hash, value noise, fbm (mirrors `GLSL_HEAD`). */
declare const WGSL_HEAD = "struct U{res:vec2f,ptr:vec2f,t:f32,speed:f32,scale:f32,pad:f32,c0:vec4f,c1:vec4f,c2:vec4f};\n@group(0) @binding(0) var<uniform> u:U;\nfn h(p:vec2f)->f32{return fract(sin(dot(p,vec2f(127.1,311.7)))*43758.5453);}\nfn n(p:vec2f)->f32{let i=floor(p);var f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2f(1.0,0.0)),f.x),mix(h(i+vec2f(0.0,1.0)),h(i+vec2f(1.0,1.0)),f.x),f.y);}\nfn fbm(p0:vec2f)->f32{var v=0.0;var a=0.5;var p=p0;for(var k=0;k<5;k++){v+=a*n(p);p=p*2.03+vec2f(1.7,9.2);a*=0.5;}return v;}\n@vertex fn vs(@builtin(vertex_index) i:u32)->@builtin(position) vec4f{var q=array<vec2f,3>(vec2f(-1.0,-1.0),vec2f(3.0,-1.0),vec2f(-1.0,3.0));return vec4f(q[i],0.0,1.0);}\n";
/**
 * Translate a GLSL `main()` body (the 6.x `ShaderSpec.body` dialect) to WGSL
 * statements. Throws on constructs it does not support (ternaries, `mod`,
 * `discard`, user functions) so the caller can fall back to WebGL2.
 */
declare function glslToWgsl(body: string): string;
/** The full WGSL module for a body. */
declare const wgslModule: (body: string) => string;
/** `true` when `navigator.gpu` exists (the adapter may still be refused). */
declare const supportsWebGPU: () => boolean;
/**
 * Start a WebGPU shader background behind `el`. Resolves to its cleanup, or
 * `null` when WebGPU cannot run this shader (the caller falls back).
 */
declare function webgpuBackground(el: HTMLElement, fx: EffectContext, spec: {
    body: string;
    wgsl?: string;
}, o: any): Promise<(() => void) | null>;

/**
 * The 6.x effect packs, one entry each (`motionary/components/fx-gpu`, …) so
 * their size budgets stay separate. This module (`registerFx2()`) registers
 * them all — used by dist/widgets.umd.js and the showcase.
 */

/** The 6.x effect packs by name. */
declare const EFFECT_PACKS: Record<string, EffectDefinition[]>;
/** Register every built-in effect pack — each one is a plugin (9.9; idempotent). */
declare function registerAllPlugins(): void;
/** A Motionary plugin: a named set of effects, plus an optional install step (9.9). */
interface MotionPlugin {
    name: string;
    effects: EffectDefinition[];
    install?: () => void;
}
/** Make a plugin object (9.9). */
declare function definePlugin(name: string, effects: EffectDefinition[], install?: () => void): MotionPlugin;
/** Every built-in effect pack as a plugin: `{ name: '<pack key>', effects }` — e.g. `retro`, `cinema` (9.9). */
declare function effectPlugins(): MotionPlugin[];
/** Register plugins (each once); returns the names of their effects (9.9). */
declare function usePlugins(...plugins: MotionPlugin[]): string[];
/**
 * Register every 6.x–9.x effect pack.
 * @deprecated 9.9 — removed in 10.0. Use `registerAllPlugins()` (same behaviour) or `usePlugins(...)`.
 */
declare function registerEffectPacks(): void;

export { AI_FX, CAMERA_MOVES, CHART_FX, CINEMA_FX, CYBER_FX, DEFAULT_MOTION_PREFS, DEPTH3_FX, EFFECT_PACKS, EFFECT_PACK_FORMAT, FESTIVAL_FX, FOCUS_FX, FORM_FX, GAME_FX, GENART_FX, GEO_FX, GESTURE3_FX, GLSL_HEAD, GPU_FX, LIGHT_FX, LOTTIE_FX, MORPH2_FX, MOTION_PREFS_KEY, MUSIC_FX, ORGANIC_FX, PALETTES, PAPER_FX, PERF3_FX, PHYSICS2_FX, RETRO_FX, SAFE_FX, SHOP_FX, SOCIAL_FX, SPATIAL_FX, SURFACE_FX, SURFACE_THEMES, TEXT3_FX, TRANSITIONS2_FX, VIDEO_FX, VerletWorld, WEATHER_FX, WGSL_HEAD, applyMotionPreferences, applySurfaceTheme, arcPath, blobRadius, cameraFrame, crossDocumentTransitions, decodeFrame, definePlugin, effectPlugins, fanAngles, fieldFallback, flashCount, fpsMeter, frameSequence, glslToWgsl, isFlashSafe, loadEffectPack, loadMotionPreferences, lottieToKeyframes, lottieToSvg, meshGradient, musicSample, offscreenRender, orientationToTilt, packManifest, pageTransition, paperRandom, parseFigure, pinchAngle, pinchScale, pixelSteps, pointsToPath, register3dPack, registerAiPack, registerAllPlugins, registerChartPack, registerCinemaPack, registerCyberPack, registerEffectPacks, registerFestivalPack, registerFocusPack, registerFormPack, registerGamePack, registerGenArtPack, registerGeoPack, registerGesture3Pack, registerGpuPack, registerLightPack, registerLottiePack, registerMorphPack, registerMusicPack, registerOrganicPack, registerPaperPack, registerPerf3Pack, registerPhysicsPack, registerRetroPack, registerSafePack, registerShopPack, registerSocialPack, registerSpatialPack, registerSurfacePack, registerTextPack, registerTransitionsPack, registerVideoPack, registerWeatherPack, riveInputs, roughLine, routeLength, runInWorker, samplePath, scrollProgress, scrubVideo, seededRandom, shaderBackground, shakeFrames, skyAt, sparkVectors, splitChars, splitWords, supportsWebGL2, supportsWebGPU, syntheticSample, throwPath, trackPointer, usePlugins, validateManifest, vestibularSafe, webgpuBackground, wgslModule, xrSupport, yawToOffset };
export type { EffectPackManifest, MotionPlugin, ShaderSpec };
