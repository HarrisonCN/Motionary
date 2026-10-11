'use strict';

var base = require('../chunks/base-BvH4nAcv.cjs');

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
/** watched owners → off screen? (detached ones are swept: unobserved, and the plug-in tears down when none remain) */
const seen = /*#__PURE__*/ new Map();
let io;
let wake;
/** Remove the pause (everything parked runs again). Re-installed lazily by the next `raf` / `onFrame`. */
const un = () => {
    if (io !== undefined) {
        document.removeEventListener('visibilitychange', wake);
        io?.disconnect();
        io = undefined;
        seen.clear();
        base.setPauseHook();
        wake();
    }
};
/** Unobserve detached owners; with nothing left to watch, drop the listener + observer. */
const sweep = () => {
    seen.forEach((_, el) => el.isConnected || (seen.delete(el), io?.unobserve(el)));
    seen.size || un();
};
/** Install the offscreen / hidden-tab pause (idempotent). Returns an uninstall function. */
function installOffscreenPause() {
    if (io === undefined && typeof document == 'object') {
        io =
            typeof IntersectionObserver == 'function'
                ? new IntersectionObserver((es) => {
                    for (const e of es)
                        seen.set(e.target, !e.isIntersecting);
                    wake();
                    sweep();
                })
                : null;
        wake = base.setPauseHook((el) => document.hidden || seen.get(el), (el) => {
            seen.has(el) || (seen.set(el, false), io?.observe(el));
            sweep();
        });
        document.addEventListener('visibilitychange', wake);
    }
    return un;
}
/** `raf(cb, el)` with the offscreen pause installed. */
const raf = (cb, el) => (installOffscreenPause(), base.raf(cb, el));
/** `onFrame(fn, el)` with the offscreen pause installed. */
const onFrame = (fn, el) => (installOffscreenPause(), base.onFrame(fn, el));

exports.caf = base.caf;
exports.installOffscreenPause = installOffscreenPause;
exports.onFrame = onFrame;
exports.raf = raf;
//# sourceMappingURL=https://raw.githubusercontent.com/HarrisonCN/Motionary/v13.9.0/dist/components/offscreen.cjs.map