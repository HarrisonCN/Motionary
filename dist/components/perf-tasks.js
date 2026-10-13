import { n as now } from '../chunks/base-ByyAdGqz.js';

/**
 * motionary/components/perf — long-task helpers (13.4).
 *
 * `yieldToMain()` gives the browser a chance to handle input and paint:
 * `scheduler.yield()` where it exists (Chromium 129+), otherwise a
 * MessageChannel macrotask, otherwise `setTimeout(0)`.
 * `shouldYield()` uses `navigator.scheduling.isInputPending()` where
 * available and always falls back to a time slice.
 * `runChunked()` processes a list in slices that each stay inside a frame
 * budget, yielding between slices, so a big setup never becomes a long task.
 */
/** Resolve on a fresh macrotask (scheduler.yield → MessageChannel → setTimeout). */
function yieldToMain() {
    const s = globalThis.scheduler;
    if (s && typeof s.yield === 'function')
        return s.yield();
    if (typeof MessageChannel === 'function') {
        return new Promise((ok) => {
            const c = new MessageChannel();
            c.port1.onmessage = () => {
                c.port1.close();
                ok();
            };
            c.port2.postMessage(0);
        });
    }
    return new Promise((ok) => setTimeout(ok, 0));
}
/** True when the current slice that started at `since` should give way: pending input, or `budget` ms used. */
function shouldYield(since, budget = 8) {
    const sch = typeof navigator !== 'undefined' ? navigator.scheduling : undefined;
    try {
        if (sch && typeof sch.isInputPending === 'function' && sch.isInputPending())
            return true;
    }
    catch {
        /* isInputPending may throw in cross-origin iframes */
    }
    return now() - since >= budget;
}
/** Run `fn` for every item in budgeted slices, yielding to the main thread between slices. */
async function runChunked(items, fn, options = {}) {
    const budget = options.budget ?? 8;
    const list = Array.from(items);
    let i = 0;
    let yields = 0;
    while (i < list.length) {
        if (options.signal?.aborted)
            return { done: i, yields, aborted: true };
        const since = now();
        do
            fn(list[i], i++);
        while (i < list.length && !shouldYield(since, budget));
        if (i < list.length) {
            yields++;
            await yieldToMain();
        }
    }
    return { done: i, yields, aborted: false };
}

export { runChunked, shouldYield, yieldToMain };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v14.7.0/dist/components/perf-tasks.js.map