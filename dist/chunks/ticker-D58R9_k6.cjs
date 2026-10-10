'use strict';

var registry = require('./registry-U0scTJZr.cjs');

/**
 * The shared ticker: one requestAnimationFrame loop per page (or worker) for
 * every runtime animation, with lag smoothing and a frame budget readout.
 * Falls back to a 16 ms timer where rAF is missing (Node, some workers).
 * Nothing runs until the first listener is added (SSR-safe).
 */
function createTicker() {
    const fns = new Set();
    let time = 0, last = -1, fps = 60, maxDelta = 100, handle = null;
    const g = globalThis;
    const now = () => (g.performance?.now ? g.performance.now() : Date.now());
    const raf = (cb) => (typeof g.requestAnimationFrame === 'function' ? g.requestAnimationFrame(cb) : setTimeout(() => cb(now()), 16));
    const caf = (h) => (typeof g.cancelAnimationFrame === 'function' ? g.cancelAnimationFrame(h) : clearTimeout(h));
    const run = (dt, cap = true) => {
        const d = (cap ? Math.min(dt, maxDelta) : dt) * t.timeScale;
        time += d;
        for (const fn of Array.from(fns))
            fn(time, d);
    };
    const frame = (ts) => {
        handle = null;
        if (!fns.size)
            return;
        const n = typeof ts === 'number' && ts > 0 ? ts : now();
        const dt = last < 0 ? 0 : n - last;
        last = n;
        if (dt > 0)
            fps = fps * 0.9 + (1000 / dt) * 0.1;
        run(dt);
        if (fns.size)
            handle = raf(frame);
    };
    const wake = () => {
        if (handle === null && fns.size) {
            last = -1;
            handle = raf(frame);
        }
    };
    const t = {
        add(fn) {
            fns.add(fn);
            wake();
            return () => t.remove(fn);
        },
        remove(fn) {
            fns.delete(fn);
            if (!fns.size && handle !== null) {
                caf(handle);
                handle = null;
            }
        },
        get time() { return time; },
        get fps() { return Math.round(fps); },
        get size() { return fns.size; },
        lagSmoothing(ms) { maxDelta = ms > 0 ? ms : Infinity; },
        timeScale: 1,
        step(ms) { run(ms, false); },
    };
    return t;
}
/** The page-wide ticker (shared across every copy of the runtime). */
function getTicker() {
    const s = registry.registry().slots;
    return (s.ticker || (s.ticker = createTicker()));
}

exports.getTicker = getTicker;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v11.6.0/dist/chunks/ticker-D58R9_k6.cjs.map