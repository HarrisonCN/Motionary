/**
 * `motionary/core` (10.0) — the zero-dependency core, under 10 KB gzip.
 *
 * Everything else is a plugin: `createMotion().use(retro, cinema)` with the
 * packs from `motionary/plugins` (or your own `{ name, effects }`).
 *
 * - `createMotion({ reducedMotion, rate })` → an instance with `use()`,
 *   `play(el, effect, options)`, `bind(el, effect, { trigger })`,
 *   `reveal(targets, preset, { stagger, once, threshold })`, `animate()`,
 *   `pause()` / `resume()` / `setRate()` for everything it started,
 *   `effects()` and `destroy()`.
 * - `PRESETS` — entrance keyframes (fade, fade-up/down/left/right, scale,
 *   zoom-in/out, blur-in, flip-up), registered as `enter` effects.
 * - `preferredBackend()` — `webgpu` (default when available) → `webgl2` →
 *   `canvas`, the order GPU plugins use.
 *
 * Reduced motion is honoured everywhere (OS setting or `reducedMotion:
 * 'reduce'`): entrances fade, loops / backgrounds / cursors are skipped.
 */
declare const VERSION = "10.0.0";
type CoreEffectKind = 'enter' | 'exit' | 'attention' | 'hover' | 'click' | 'loop' | 'background' | 'cursor' | 'text' | 'scroll' | (string & {});
interface CoreEffectContext {
    reduced: boolean;
    sensitivity: 'full' | 'gentle' | 'minimal' | 'static';
    event?: Event;
    animate(el: Element, keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: number | KeyframeAnimationOptions): Animation | null;
    onCleanup(fn: () => void): void;
}
interface CoreEffect {
    name: string;
    kind: CoreEffectKind;
    description?: string;
    defaults?: Record<string, unknown>;
    reduced?: 'skip' | 'run';
    run(el: HTMLElement, options: any, ctx: CoreEffectContext): unknown;
}
interface CorePlugin {
    name: string;
    effects?: CoreEffect[];
    install?(m: MotionInstance): void;
}
type Trigger = 'click' | 'hover' | 'enter' | 'load' | 'loop' | 'manual';
interface RevealOptions {
    stagger?: number;
    delay?: number;
    duration?: number;
    easing?: string;
    once?: boolean;
    threshold?: number;
}
interface MotionInstance {
    readonly paused: boolean;
    readonly rate: number;
    use(...plugins: CorePlugin[]): MotionInstance;
    has(effect: string): boolean;
    effects(): string[];
    reduced(): boolean;
    animate(el: Element, keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: number | KeyframeAnimationOptions): Animation | null;
    play(el: HTMLElement, effect: string, options?: Record<string, unknown>, event?: Event): Promise<void>;
    bind(el: HTMLElement, effect: string, options?: Record<string, unknown> & {
        trigger?: Trigger;
        once?: boolean;
    }): () => void;
    reveal(targets: string | Element | ArrayLike<Element>, preset?: string, options?: RevealOptions): () => void;
    pause(): void;
    resume(): void;
    setRate(rate: number): void;
    destroy(): void;
}
/** Entrance keyframes (10.0). */
declare const PRESETS: Record<string, Keyframe[]>;
/** GPU backend order used by GPU plugins: WebGPU by default (10.0). */
declare function preferredBackend(): 'webgpu' | 'webgl2' | 'canvas';
/** Create a Motionary core instance (10.0). */
declare function createMotion(config?: {
    reducedMotion?: 'user' | 'reduce';
    rate?: number;
}): MotionInstance;

export { PRESETS, VERSION, createMotion, preferredBackend };
export type { CoreEffect, CoreEffectContext, CoreEffectKind, CorePlugin, MotionInstance, RevealOptions, Trigger };
