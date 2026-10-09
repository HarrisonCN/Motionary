import { defineElement, type UsaElement } from '../base';
import css from './rive.css?raw';

/**
 * `<usa-rive src="vehicles.riv" state-machine="bumpy" autoplay></usa-rive>`
 * (10.6) — plays Rive (`.riv`) files with the **official Rive runtime**
 * `@rive-app/canvas` (an optional peer dependency; `.riv` is Rive's
 * proprietary binary format, so Motionary does not reimplement it). The
 * runtime is loaded lazily on first use: from `provideRiveRuntime(() =>
 * import('@rive-app/canvas'))` (bundlers, after `npm i @rive-app/canvas`),
 * from `window.rive` (the official CDN script), an import map, or from
 * `runtime-src` (a URL to the official ESM / UMD build). Missing →
 * a clear message in place + `usa:runtime-missing`. `artboard`,
 * `animation`, `state-machine`, `autoplay`, `fit` (contain · cover · fill ·
 * fitWidth · fitHeight · none), `label`. `rive` (the official instance),
 * `play()`, `pause()`, `input(name)` (state-machine input); `usa:load`,
 * `usa:error`. Reduced motion: paused on the first frame.
 */
export interface UsaRiveElement extends UsaElement {
  readonly rive: any;
  play(): void;
  pause(): void;
  input(name: string): any;
}

export const RIVE_PEER = '@rive-app/canvas';
export const RIVE_CDN = 'https://unpkg.com/@rive-app/canvas@2.44.1/rive.js';

let pending: Promise<any> | null = null;
let provided: (() => any) | null = null;

/**
 * Hand `<usa-rive>` the official runtime yourself — the module, or (better) a
 * lazy loader such as `() => import('@rive-app/canvas')` for bundlers that do
 * not follow the element's own optional import. Call before the element mounts.
 */
export function provideRiveRuntime(runtime: unknown | (() => unknown)): void {
  provided = typeof runtime === 'function' && !(runtime as any).Rive ? (runtime as () => unknown) : () => runtime;
  pending = null;
}
const riveOf = (m: any): any => (m?.Rive ? m : m?.default?.Rive ? m.default : null);
/** Load the official runtime: window.rive → import('@rive-app/canvas') → `runtimeSrc` script. */
export function loadRiveRuntime(runtimeSrc?: string): Promise<any> {
  const g = globalThis as any;
  if (g.rive?.Rive) return Promise.resolve(g.rive);
  if (pending) return pending;
  pending = (async () => {
    if (provided) {
      const m = riveOf(await provided());
      if (m) return m;
    }
    try {
      // A computed specifier on purpose: a literal import('@rive-app/canvas') would break the builds of everyone who
      // uses motionary/components/widgets without Rive. Works with an import map; bundler users call
      // provideRiveRuntime(() => import('@rive-app/canvas')) instead.
      const spec = RIVE_PEER;
      const m: any = await import(/* @vite-ignore */ /* webpackIgnore: true */ spec);
      if (riveOf(m)) return riveOf(m);
    } catch {
      /* not bundled */
    }
    if (runtimeSrc && typeof document !== 'undefined') {
      await new Promise<void>((ok, bad) => {
        const s = document.createElement('script');
        s.src = runtimeSrc;
        s.onload = () => ok();
        s.onerror = () => bad(new Error('load failed'));
        document.head.appendChild(s);
      });
      if (g.rive?.Rive) return g.rive;
    }
    throw new Error(`[motionary] <usa-rive> requires the official Rive runtime ${RIVE_PEER} (optional peer dependency). Install it (npm i ${RIVE_PEER}) and call provideRiveRuntime(() => import('${RIVE_PEER}')) before the element mounts — or load it from a CDN before the component: <script src="${RIVE_CDN}"></script> (or set runtime-src). Docs: https://github.com/HarrisonCN/Motionary/blob/main/docs/runtime/rive.md`);
  })();
  pending.catch(() => (pending = null));
  return pending;
}

export function defineRive(tag = 'usa-rive'): CustomElementConstructor | undefined {
  return defineElement(
    tag,
    (Base) => {
      class UsaRive extends Base {
        static get observedAttributes(): string[] {
          return ['src', 'artboard', 'animation', 'state-machine', 'autoplay', 'fit', 'label', 'runtime-src'];
        }
        private r: any = null;
        get rive(): any {
          return this.r;
        }
        play(): void {
          this.r?.play();
        }
        pause(): void {
          this.r?.pause();
        }
        input(name: string): any {
          const sm = this.str('state-machine');
          return sm ? this.r?.stateMachineInputs?.(sm)?.find((i: any) => i.name === name) : undefined;
        }
        mount(): void {
          const canvas = document.createElement('canvas');
          canvas.setAttribute('role', 'img');
          canvas.setAttribute('aria-label', this.str('label', 'Rive animation'));
          this.querySelector(':scope > canvas')?.remove();
          this.prepend(canvas);
          let alive = true;
          this.onCleanup(() => {
            alive = false;
            this.r?.cleanup?.();
            this.r = null;
            canvas.remove();
          });
          loadRiveRuntime(this.str('runtime-src') || undefined)
            .then((rive) => {
              if (!alive) return;
              const dpr = Math.min(2, devicePixelRatio || 1);
              canvas.width = Math.round((canvas.clientWidth || 240) * dpr);
              canvas.height = Math.round((canvas.clientHeight || 240) * dpr);
              const fit = this.str('fit', 'contain');
              this.r = new rive.Rive({
                src: new URL(this.str('src'), location.href).href,
                canvas,
                artboard: this.str('artboard') || undefined,
                animations: this.str('animation') || undefined,
                stateMachines: this.str('state-machine') || undefined,
                autoplay: this.flag('autoplay') && !this.reduced,
                layout: rive.Layout ? new rive.Layout({ fit: rive.Fit?.[fit[0].toUpperCase() + fit.slice(1)] ?? fit }) : undefined,
                onLoad: () => {
                  this.r?.resizeDrawingSurfaceToCanvas?.();
                  this.emit('load', { artboard: this.r?.activeArtboard, stateMachines: this.r?.stateMachineNames, animations: this.r?.animationNames });
                },
                onLoadError: (e: unknown) => this.emit('error', { error: String((e as any)?.message || e) }),
              });
            })
            .catch((e) => {
              if (!alive) return;
              const msg = String(e?.message || e);
              const p = document.createElement('p');
              p.className = 'usa-rt-missing';
              p.setAttribute('role', 'alert');
              p.textContent = msg;
              this.prepend(p);
              this.onCleanup(() => p.remove());
              console.error(msg);
              this.emit('runtime-missing', { module: RIVE_PEER, message: msg });
            });
        }
      }
      return UsaRive as unknown as CustomElementConstructor;
    },
    { id: 'rive', text: css }
  );
}
