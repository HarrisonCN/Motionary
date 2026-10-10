'use strict';

var base = require('./base-B3me2y0o.cjs');

var css = "usa-rive{position:relative;display:inline-block;width:240px;height:240px;max-width:100%}usa-rive>canvas{display:block;width:100%;height:100%}usa-rive .usa-rt-missing{position:absolute;inset:0;margin:0;padding:8px;border-radius:8px;background:#fef2f2;color:#991b1b;font:11px/1.4 ui-monospace,monospace;overflow:auto;overflow-wrap:anywhere}";

const RIVE_PEER = '@rive-app/canvas';
const RIVE_CDN = 'https://unpkg.com/@rive-app/canvas@2.44.1/rive.js';
let pending = null;
let provided = null;
/**
 * Hand `<usa-rive>` the official runtime yourself — the module, or (better) a
 * lazy loader such as `() => import('@rive-app/canvas')` for bundlers that do
 * not follow the element's own optional import. Call before the element mounts.
 */
function provideRiveRuntime(runtime) {
    provided = typeof runtime === 'function' && !runtime.Rive ? runtime : () => runtime;
    pending = null;
}
const riveOf = (m) => (m?.Rive ? m : m?.default?.Rive ? m.default : null);
/** Load the official runtime: window.rive → import('@rive-app/canvas') → `runtimeSrc` script. */
function loadRiveRuntime(runtimeSrc) {
    const g = globalThis;
    if (g.rive?.Rive)
        return Promise.resolve(g.rive);
    if (pending)
        return pending;
    pending = (async () => {
        if (provided) {
            const m = riveOf(await provided());
            if (m)
                return m;
        }
        try {
            // A computed specifier on purpose: a literal import('@rive-app/canvas') would break the builds of everyone who
            // uses motionary/components/widgets without Rive. Works with an import map; bundler users call
            // provideRiveRuntime(() => import('@rive-app/canvas')) instead.
            const spec = RIVE_PEER;
            const m = await import(/* @vite-ignore */ /* webpackIgnore: true */ spec);
            if (riveOf(m))
                return riveOf(m);
        }
        catch {
            /* not bundled */
        }
        if (runtimeSrc && typeof document !== 'undefined') {
            await new Promise((ok, bad) => {
                const s = document.createElement('script');
                s.src = runtimeSrc;
                s.onload = () => ok();
                s.onerror = () => bad(new Error('load failed'));
                document.head.appendChild(s);
            });
            if (g.rive?.Rive)
                return g.rive;
        }
        throw new Error(`[motionary] <usa-rive> requires the official Rive runtime ${RIVE_PEER} (optional peer dependency). Install it (npm i ${RIVE_PEER}) and call provideRiveRuntime(() => import('${RIVE_PEER}')) before the element mounts — or load it from a CDN before the component: <script src="${RIVE_CDN}"></script> (or set runtime-src). Docs: https://github.com/HarrisonCN/Motionary/blob/main/docs/runtime/rive.md`);
    })();
    pending.catch(() => (pending = null));
    return pending;
}
function defineRive(tag = 'usa-rive') {
    return base.defineElement(tag, (Base) => {
        class UsaRive extends Base {
            constructor() {
                super(...arguments);
                this.r = null;
            }
            static get observedAttributes() {
                return ['src', 'artboard', 'animation', 'state-machine', 'autoplay', 'fit', 'label', 'runtime-src'];
            }
            get rive() {
                return this.r;
            }
            play() {
                this.r?.play();
            }
            pause() {
                this.r?.pause();
            }
            input(name) {
                const sm = this.str('state-machine');
                return sm ? this.r?.stateMachineInputs?.(sm)?.find((i) => i.name === name) : undefined;
            }
            mount() {
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
                    if (!alive)
                        return;
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
                        onLoadError: (e) => this.emit('error', { error: String(e?.message || e) }),
                    });
                })
                    .catch((e) => {
                    if (!alive)
                        return;
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
        return UsaRive;
    }, { id: 'rive', text: css });
}

exports.RIVE_CDN = RIVE_CDN;
exports.RIVE_PEER = RIVE_PEER;
exports.defineRive = defineRive;
exports.loadRiveRuntime = loadRiveRuntime;
exports.provideRiveRuntime = provideRiveRuntime;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v12.1.0/dist/chunks/rive-CfWKBIa5.cjs.map