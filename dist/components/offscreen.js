import { s as setPauseHook, o as onFrame$1, r as raf$1 } from '../chunks/base-Be98yNyq.js';
export { b as caf } from '../chunks/base-Be98yNyq.js';

/**
 * motionary/components/offscreen (13.4) — pauses scheduler work nobody can see.
 *
 * Installs a pause hook on the shared rAF scheduler: every loop / callback waits
 * while the document is hidden, and one given an owner element (`raf(cb, el)`,
 * `onFrame(fn, el)`) also waits while that element is off screen (one shared
 * IntersectionObserver). Widgets and the full bundles install it; the lite
 * bundle does not (lite keeps the frame budget and drop-on-detach only).
 * Kept deliberately tiny: it rides in every per-widget entry.
 *
 * ```ts
 * import { installOffscreenPause } from 'motionary/components/offscreen';
 * installOffscreenPause();
 * ```
 */
const off = /*#__PURE__*/ new WeakSet();
let io;
let wake;
/** Remove the pause (everything parked runs again). */
const un = () => {
    document.removeEventListener('visibilitychange', wake);
    io?.disconnect();
    io = undefined;
    setPauseHook();
    wake();
};
/** Install the offscreen / hidden-tab pause (idempotent). Returns an uninstall function. */
function installOffscreenPause() {
    if (io === undefined && typeof document == 'object') {
        io =
            typeof IntersectionObserver == 'function'
                ? new IntersectionObserver((es) => {
                    for (const e of es)
                        off[e.isIntersecting ? 'delete' : 'add'](e.target);
                    wake();
                })
                : null;
        wake = setPauseHook((el) => document.hidden || (el && off.has(el)), (el) => io?.observe(el));
        document.addEventListener('visibilitychange', wake);
    }
    return un;
}
/** `raf(cb, el)` with the offscreen pause installed. */
const raf = (cb, el) => (installOffscreenPause(), raf$1(cb, el));
/** `onFrame(fn, el)` with the offscreen pause installed. */
const onFrame = (fn, el) => (installOffscreenPause(), onFrame$1(fn, el));

export { installOffscreenPause, onFrame, raf };
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.4.0/dist/components/offscreen.js.map