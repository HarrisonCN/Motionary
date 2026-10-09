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
import { deprecate } from '../base';

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
/** Animate `canvas` with `program` in a worker (OffscreenCanvas) when possible, else on the main thread (9.6). */
export function offscreenRender(canvas: HTMLCanvasElement, program: DrawProgram, opts: { worker?: boolean; paused?: boolean } = {}): { backend: 'worker' | 'main' | 'none'; stop(): void; resize(w: number, h: number): void } {
  const code = typeof program === 'string' ? program : program.toString();
  const canWorker = opts.worker !== false && typeof Worker !== 'undefined' && typeof (canvas as any).transferControlToOffscreen === 'function' && typeof Blob !== 'undefined' && !!URL.createObjectURL;
  if (canWorker) {
    try {
      const off = (canvas as any).transferControlToOffscreen();
      const src = `let c,ctx,w,h,st={},run=true,t0=0;const draw=(${code});self.onmessage=(e)=>{const d=e.data;if(d.canvas){c=d.canvas;ctx=c.getContext('2d');w=c.width;h=c.height;const loop=(t)=>{if(run){if(!t0)t0=t;draw(ctx,t-t0,w,h,st)}requestAnimationFrame(loop)};requestAnimationFrame(loop)}if(d.size){w=c.width=d.size[0];h=c.height=d.size[1]}if('run' in d)run=d.run;if(d.stop)close()}`;
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      const w = new Worker(url);
      w.postMessage({ canvas: off }, [off]);
      if (opts.paused) w.postMessage({ run: false });
      return {
        backend: 'worker',
        stop: () => {
          w.postMessage({ stop: true });
          w.terminate();
          URL.revokeObjectURL(url);
        },
        resize: (a, b) => w.postMessage({ size: [a, b] }),
      };
    } catch {
      /* fall back to the main thread */
    }
  }
  const ctx = canvas.getContext?.('2d');
  if (!ctx) return { backend: 'none', stop: () => undefined, resize: () => undefined };
  if (typeof program === 'string') deprecate('worker-canvas-string', 'offscreenRender() / <usa-worker-canvas> with a string program fell back to the main thread, where it is evaluated with new Function (blocked by a strict CSP). Deprecated in 10.9; 11.0 refuses string programs on the main thread — pass a function. See docs/upgrading-11.md.');
  // eslint-disable-next-line no-new-func
  const draw = typeof program === 'function' ? program : (new Function(`return (${code})`)() as Exclude<DrawProgram, string>);
  const st: Record<string, unknown> = {};
  let t = 0;
  const stop = opts.paused
    ? () => undefined
    : onFrame((_now, dt) => {
        t += dt;
        draw(ctx, t, canvas.width, canvas.height, st);
      });
  if (opts.paused) draw(ctx, 0, canvas.width, canvas.height, st);
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
