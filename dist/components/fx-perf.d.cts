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
/**
 * Animate `canvas` with `program` in a worker (OffscreenCanvas) when possible, else on the main thread (9.6).
 * 11.0: a **string** program only runs in a worker. Without a worker it needs `opts.fallback` (a function);
 * otherwise it is refused (`backend: 'none'`, console error) — strings are never evaluated on the main thread.
 */
declare function offscreenRender(canvas: HTMLCanvasElement, program: DrawProgram, opts?: {
    worker?: boolean;
    paused?: boolean;
    fallback?: Exclude<DrawProgram, string>;
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

export { PERF3_FX, fpsMeter, offscreenRender, registerPerf3Pack, runInWorker };
export type { DrawProgram };
