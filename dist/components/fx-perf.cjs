'use strict';

var registry = require('../chunks/registry-_XKU28ZC.cjs');
var base = require('../chunks/base-DzZEJhQB.cjs');

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
        let worker;
        let url;
        const releaseUrl = () => {
            if (url)
                URL.revokeObjectURL(url);
            url = undefined;
        };
        try {
            const src = `const draw=(${code});let canvas,ctx,start,paused;
        const state={};
        function paint(t){draw(ctx,t,canvas.width,canvas.height,state)}
        function frame(t){start??=t;paint(t-start);requestAnimationFrame(frame)}
        self.onmessage=({data})=>{
          if(data.canvas){
            canvas=data.canvas;ctx=canvas.getContext('2d');paused=data.paused;
            if(paused) paint(0);else requestAnimationFrame(frame);
          }else if(data.size){
            [canvas.width,canvas.height]=data.size;if(paused) paint(0);
          }
        };postMessage('ready')`;
            url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
            const w = worker = new Worker(url);
            let transferred = false;
            const stop = () => {
                w.onmessage = w.onerror = null;
                w.terminate();
                releaseUrl();
            };
            const handle = {
                backend: 'worker', stop,
                resize(a, b) {
                    if (transferred)
                        w.postMessage({ size: [a, b] });
                    else {
                        canvas.width = a;
                        canvas.height = b;
                    }
                },
            };
            const recover = () => {
                stop();
                const fallback = transferred ? { backend: 'none', stop() { }, resize() { } }
                    : offscreenRender(canvas, program, { ...opts, worker: false });
                Object.assign(handle, fallback);
                opts.onBackendChange?.(fallback.backend);
            };
            w.onerror = (e) => { e.preventDefault(); recover(); };
            w.onmessage = () => {
                w.onmessage = null;
                releaseUrl();
                try {
                    const off = canvas.transferControlToOffscreen();
                    transferred = true;
                    w.postMessage({ canvas: off, paused: !!opts.paused }, [off]);
                }
                catch {
                    recover();
                }
            };
            return handle;
        }
        catch {
            worker?.terminate();
            releaseUrl();
        }
    }
    let ctx = null;
    try {
        ctx = canvas.getContext('2d');
    }
    catch { /* canvas already transferred */ }
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
            if (opts.paused)
                draw(ctx, 0, a, b, st);
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
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v17.6.0/dist/components/fx-perf.cjs.map