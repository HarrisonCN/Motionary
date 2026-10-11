type MotionPlayState = 'idle' | 'running' | 'paused' | 'finished';
/** The one controller interface of Motion Engine v2 (animate, sequence, parallel, stagger, spring and timeline all return it). */
interface MotionControls {
    /** Total length in ms (`Infinity` with `repeat: Infinity`). */
    readonly duration: number;
    /** Playhead in ms; setting it seeks. */
    currentTime: number;
    /** Playhead as 0–1 of `duration`; setting it seeks. */
    progress: number;
    /** Speed and direction (negative = reversed). Default 1. */
    playbackRate: number;
    readonly playState: MotionPlayState;
    /** Resolves (with these controls) when playback reaches its end — or 0 when reversed; rejects with an `AbortError` on `cancel()`. A new promise after each finish. */
    readonly finished: Promise<MotionControls>;
    play(): MotionControls;
    pause(): MotionControls;
    /** Jump to `ms` (clamped to 0–duration) and render it. */
    seek(ms: number): MotionControls;
    /** Flip the direction (and play). */
    reverse(): MotionControls;
    /** Jump to the end (or 0 when reversed) and resolve `finished`. */
    finish(): MotionControls;
    /** Stop, remove every effect this motion applied, reject `finished`. */
    cancel(): void;
}
interface ControlOptions {
    /** Start playing right away (default `true`). */
    autoplay?: boolean;
    /** Speed (default 1; negative plays backwards). */
    playbackRate?: number;
    /** `'respect'` (default): under `prefers-reduced-motion` playing jumps to the end. `'ignore'`: always animate. */
    reducedMotion?: 'respect' | 'ignore';
    /** Called after each rendered frame / seek with the 0–1 progress. */
    onUpdate?: (progress: number) => void;
    /** Called when playback finishes. */
    onComplete?: () => void;
}

interface PlaySceneOptions extends ControlOptions {
    /** Called when the playhead first passes an effect track (`<usa-player>` fires registered effects; the engine leaves that to you). */
    onEffect?: (el: Element, effect: string, options: Record<string, unknown>) => void;
}
/**
 * Play a Scene Format v2 document (or `motionary-timeline` v1 / animation JSON v1) inside `root` with
 * Motion Engine v2: one standard controller for the whole scene. Token references, mute / solo and
 * seeded `random()` are resolved like `<usa-player>` does (same loader).
 */
declare function playScene(root: Element, doc: any, options?: PlaySceneOptions): MotionControls;

export { playScene };
export type { ControlOptions, MotionControls, MotionPlayState, PlaySceneOptions };
