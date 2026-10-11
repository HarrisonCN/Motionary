/** Resolve on a fresh macrotask (scheduler.yield → MessageChannel → setTimeout). */
declare function yieldToMain(): Promise<void>;
/** True when the current slice that started at `since` should give way: pending input, or `budget` ms used. */
declare function shouldYield(since: number, budget?: number): boolean;
interface ChunkOptions {
    /** ms of work per slice before yielding (default 8). */
    budget?: number;
    /** Stop early (e.g. the owning element disconnected). */
    signal?: AbortSignal;
}
interface ChunkResult {
    /** Items processed. */
    done: number;
    /** Times the work yielded to the main thread. */
    yields: number;
    /** True when the signal aborted the run. */
    aborted: boolean;
}
/** Run `fn` for every item in budgeted slices, yielding to the main thread between slices. */
declare function runChunked<T>(items: Iterable<T>, fn: (item: T, index: number) => void, options?: ChunkOptions): Promise<ChunkResult>;

export { runChunked, shouldYield, yieldToMain };
export type { ChunkOptions, ChunkResult };
