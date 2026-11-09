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
import type { EffectContext, EffectDefinition } from '../fx/registry';
import { registerEffects } from '../fx/registry';
import { onFrame } from '../base';

/** Run a pure function in a Web Worker; resolves with its (structured-cloneable) result (9.6). */
export function runInWorker<A extends unknown[], R>(fn: (...args: A) => R | Promise<R>, ...args: A): Promise<R> {
  if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL === 'undefined' || !URL.createObjectURL) return Promise.resolve().then(() => fn(...args));
  const src = `self.onmessage=async(e)=>{try{const r=await (${fn.toString()})(...e.data);self.postMessage({ok:true,r})}catch(err){self.postMessage({ok:false,e:String(err&&err.message||err)})}}`;
  const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  return new Promise<R>((resolve, reject) => {
    let w: Worker;
    try {
      w = new Worker(url);
    } catch (e) {
      URL.revokeObjectURL(url);
      return resolve(Promise.resolve().then(() => fn(...args)));
    }
    const done = () => {
      w.terminate();
      URL.revokeObjectURL(url);
    };
    w.onmessage = (e) => {
      done();
      if (e.data?.ok) resolve(e.data.r as R);
      else reject(new Error(e.data?.e || 'worker failed'));
    };
    w.onerror = (e) => {
      done();
      reject(new Error(e.message || 'worker error'));
    };
    w.postMessage(args);
  });
}

export type DrawProgram = string | ((ctx: CanvasRenderingContext2D, t: number, w: number, h: number, state: Record<string, unknown>) => void);
/**
 * Animate `canvas` with `program` in a worker (OffscreenCanvas) when possible, else on the main thread (9.6).
 * 11.0: a **string** program only runs in a worker. Without a worker it needs `opts.fallback` (a function);
 * otherwise it is refused (`backend: 'none'`, console error) — strings are never evaluated on the main thread.
 */
export function offscreenRender(canvas: HTMLCanvasElement, program: DrawProgram, opts: { worker?: boolean; paused?: boolean; fallback?: Exclude<DrawProgram, string>; onBackendChange?: (backend: 'main' | 'none') => void } = {}): { backend: 'worker' | 'main' | 'none'; stop(): void; resize(w: number, h: number): void } {
  const code = typeof program === 'string' ? program : program.toString();
  const canWorker = opts.worker !== false && typeof Worker !== 'undefined' && typeof (canvas as any).transferControlToOffscreen === 'function' && typeof Blob !== 'undefined' && !!URL.createObjectURL;
  if (canWorker) {
    let worker: Worker | undefined;
    let url: string | undefined;

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
      };
      const handle: ReturnType<typeof offscreenRender> = {
        backend: 'worker', stop,
        resize(a, b) {
          if (transferred) w.postMessage({ size: [a, b] });
          else { canvas.width = a; canvas.height = b; }
        },
      };
      const recover = () => {
        stop();
        const fallback = transferred ? { backend: 'none' as const, stop() {}, resize() {} }
          : offscreenRender(canvas, program, { ...opts, worker: false });
        Object.assign(handle, fallback);
        opts.onBackendChange?.(fallback.backend as 'none' | 'main');
      };
      w.onerror = (e) => { e.preventDefault(); recover(); };
      w.onmessage = () => {
        w.onmessage = null;
        try {
          const off = canvas.transferControlToOffscreen();
          transferred = true;
          w.postMessage({ canvas: off, paused: !!opts.paused }, [off]);
        } catch { recover(); }
      };
      return handle;
    } catch {
      worker?.terminate();
    } finally {
      if (url) URL.revokeObjectURL(url);
    }
  }
  let ctx: CanvasRenderingContext2D | null = null;
  try { ctx = canvas.getContext('2d'); } catch { /* canvas already transferred */ }
  if (!ctx) return { backend: 'none', stop: () => undefined, resize: () => undefined };
  if (typeof program === 'string' && !opts.fallback) {
    console.error('[motionary] offscreenRender() / <usa-worker-canvas>: a string program can only run in a worker (OffscreenCanvas); 11.0 no longer evaluates it on the main thread (new Function) — pass a function. See docs/upgrading-11.md.');
    return { backend: 'none', stop: () => undefined, resize: () => undefined };
  }
  const draw = typeof program === 'function' ? program : (opts.fallback as Exclude<DrawProgram, string>);
  const st: Record<string, unknown> = {};
  let t = 0;
  const stop = opts.paused
    ? () => undefined
    : onFrame((_now, dt) => {
        t += dt;
        draw(ctx!, t, canvas.width, canvas.height, st);
      });
  if (opts.paused) draw(ctx, 0, canvas.width, canvas.height, st);
  return {
    backend: 'main',
    stop,
    resize: (a, b) => {
      canvas.width = a;
      canvas.height = b;
      if (opts.paused) draw(ctx!, 0, a, b, st);
    },
  };
}

/** A rolling FPS meter on the shared frame loop: { fps, stop } (fps updates every frame) (9.6). */
export function fpsMeter(window = 30): { readonly fps: number; readonly samples: number[]; stop(): void } {
  const samples: number[] = [];
  let fps = 0;
  const stop = onFrame((_t, dt) => {
    if (dt <= 0) return;
    samples.push(1000 / dt);
    if (samples.length > window) samples.shift();
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

export const PERF3_FX: EffectDefinition[] = [
  {
    name: 'idle-reveal',
    kind: 'enter',
    description: 'Waits for an idle moment (requestIdleCallback, ≤ `timeout` ms) before fading in, keeping first paint and input snappy.',
    defaults: { duration: 400, timeout: 600 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      const prev = el.style.opacity;
      el.style.opacity = '0';
      ctx.onCleanup(() => (el.style.opacity = prev));
      return new Promise<void>((resolve) => {
        const go = () => {
          el.style.opacity = prev;
          const a = ctx.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: o.duration, easing: 'ease-out' });
          if (a) a.finished.then(() => resolve(), () => resolve());
          else resolve();
        };
        const ric = (globalThis as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined;
        if (ric) ric(go, { timeout: Number(o.timeout) || 600 });
        else setTimeout(go, 1);
      });
    },
  },
  {
    name: 'gpu-lift',
    kind: 'hover',
    description: 'A compositor-only hover lift — only transform and opacity change, so it never triggers layout or paint.',
    defaults: { duration: 250, lift: 6 },
    run: (el: HTMLElement, o: any, ctx: EffectContext) => {
      if (ctx.reduced) return;
      return ctx.animate(el, [{ transform: 'translateY(0) scale(1)' }, { transform: `translateY(${-Math.abs(Number(o.lift) || 6)}px) scale(1.02)` }], { duration: o.duration, easing: 'ease-out', fill: 'forwards' })?.finished.catch(() => undefined);
    },
  },
];

/** Register idle-reveal and gpu-lift (9.6). */
export function registerPerf3Pack(): void {
  registerEffects(PERF3_FX);
}
