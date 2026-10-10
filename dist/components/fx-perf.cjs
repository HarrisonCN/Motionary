'use strict';

var registry = require('../chunks/registry-LE5iyTqw.cjs');
var base = require('../chunks/base-BG_mxssu.cjs');

/** Run a pure function in a Web Worker; resolves with its (structured-cloneable) result (9.6). */
function runInWorker(fn, ...args) {
    if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL)
        return Promise.resolve().then(() => fn(...args));
    const src = `self.onmessage=async(e)=>{try{const r=await (${fn.toString()})(...e.data);self.postMessage({ok:true,r})}catch(err){self.postMessage({ok:false,e:String(err&&err.message||err)})}}`;
    const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    return new Promise((resolve, reject) => {
        let w;
        try {
            w = new Worker(url);
        }
        catch (e) {
            URL.revokeObjectURL(url);
            return resolve(Promise.resolve().then(() => fn(...args)));
        }
        const done = () => {
            w.terminate();
            URL.revokeObjectURL(url);
        };
        w.onmessage = (e) => {
            done();
            if (e.data?.ok)
                resolve(e.data.r);
            else
                reject(new Error(e.data?.e || 'worker failed'));
        };
        w.onerror = (e) => {
            done();
            reject(new Error(e.message || 'worker error'));
        };
        w.postMessage(args);
    });
}
/**
 * Animate `canvas` with `program` in a worker (OffscreenCanvas) when possible, else on the main thread (9.6).
 * 11.0: a **string** program only runs in a worker. Without a worker it needs `opts.fallback` (a function);
 * otherwise it is refused (`backend: 'none'`, console error) — strings are never evaluated on the main thread.
 */
function offscreenRender(canvas, program, opts = {}) {
    const code = typeof program === 'string' ? program : program.toString();
    const canWorker = opts.worker !== false && typeof Worker !== 'undefined' && typeof canvas.transferControlToOffscreen === 'function' && typeof Blob !== 'undefined' && !!URL.createObjectURL;
    if (canWorker) {
        try {
            const off = canvas.transferControlToOffscreen();
            const src = `let c,ctx,w,h,st={},run=true,t0=0;const draw=(${code});self.onmessage=(e)=>{const d=e.data;if(d.canvas){c=d.canvas;ctx=c.getContext('2d');w=c.width;h=c.height;const loop=(t)=>{if(run){if(!t0)t0=t;draw(ctx,t-t0,w,h,st)}requestAnimationFrame(loop)};requestAnimationFrame(loop)}if(d.size){w=c.width=d.size[0];h=c.height=d.size[1]}if('run' in d)run=d.run;if(d.stop)close()}`;
            const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
            const w = new Worker(url);
            w.postMessage({ canvas: off }, [off]);
            if (opts.paused)
                w.postMessage({ run: false });
            return {
                backend: 'worker',
                stop: () => {
                    w.postMessage({ stop: true });
                    w.terminate();
                    URL.revokeObjectURL(url);
                },
                resize: (a, b) => w.postMessage({ size: [a, b] }),
            };
        }
        catch {
            /* fall back to the main thread */
        }
    }
    const ctx = canvas.getContext?.('2d');
    if (!ctx)
        return { backend: 'none', stop: () => undefined, resize: () => undefined };
    if (typeof program === 'string' && !opts.fallback) {
        console.error('[motionary] offscreenRender() / <usa-worker-canvas>: a string program can only run in a worker (OffscreenCanvas); 11.0 no longer evaluates it on the main thread (new Function) — pass a function. See docs/upgrading-11.md.');
        return { backend: 'none', stop: () => undefined, resize: () => undefined };
    }
    const draw = typeof program === 'function' ? program : opts.fallback;
    const st = {};
    let t = 0;
    const stop = opts.paused
        ? () => undefined
        : base.onFrame((_now, dt) => {
            t += dt;
            draw(ctx, t, canvas.width, canvas.height, st);
        });
    if (opts.paused)
        draw(ctx, 0, canvas.width, canvas.height, st);
    return {
        backend: 'main',
        stop,
        resize: (a, b) => {
            canvas.width = a;
            canvas.height = b;
        },
    };
}
/** A rolling FPS meter on the shared frame loop: { fps, stop } (fps updates every frame) (9.6). */
function fpsMeter(window = 30) {
    const samples = [];
    let fps = 0;
    const stop = base.onFrame((_t, dt) => {
        if (dt <= 0)
            return;
        samples.push(1000 / dt);
        if (samples.length > window)
            samples.shift();
        fps = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
    });
    return {
        get fps() {
            return fps;
        },
        samples,
        stop,
    };
}
const PERF3_FX = [
    {
        name: 'idle-reveal',
        kind: 'enter',
        description: 'Waits for an idle moment (requestIdleCallback, ≤ `timeout` ms) before fading in, keeping first paint and input snappy.',
        defaults: { duration: 400, timeout: 600 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            const prev = el.style.opacity;
            el.style.opacity = '0';
            ctx.onCleanup(() => (el.style.opacity = prev));
            return new Promise((resolve) => {
                const go = () => {
                    el.style.opacity = prev;
                    const a = ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: o.duration, easing: 'ease-out' });
                    if (a)
                        a.finished.then(() => resolve(), () => resolve());
                    else
                        resolve();
                };
                const ric = globalThis.requestIdleCallback;
                if (ric)
                    ric(go, { timeout: Number(o.timeout) || 600 });
                else
                    setTimeout(go, 1);
            });
        },
    },
    {
        name: 'gpu-lift',
        kind: 'hover',
        description: 'A compositor-only hover lift — only transform and opacity change, so it never triggers layout or paint.',
        defaults: { duration: 250, lift: 6 },
        run: (el, o, ctx) => {
            if (ctx.reduced)
                return;
            return ctx.animate(el, [{ transform: 'translateY(0) scale(1)' }, { transform: `translateY(${-Math.abs(Number(o.lift) || 6)}px) scale(1.02)` }], { duration: o.duration, easing: 'ease-out', fill: 'forwards' })?.finished.catch(() => undefined);
        },
    },
];
/** Register idle-reveal and gpu-lift (9.6). */
function registerPerf3Pack() {
    registry.registerEffects(PERF3_FX);
}

exports.PERF3_FX = PERF3_FX;
exports.fpsMeter = fpsMeter;
exports.offscreenRender = offscreenRender;
exports.registerPerf3Pack = registerPerf3Pack;
exports.runInWorker = runInWorker;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.0.1/dist/components/fx-perf.cjs.map