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
import { raf as R, onFrame as F, setPauseHook as H } from './base';

const off = /*#__PURE__*/ new WeakSet<Element>();
let io: IntersectionObserver | null | undefined;
let wake: () => void;

/** Remove the pause (everything parked runs again). */
const un = (): void => {
  document.removeEventListener('visibilitychange', wake);
  io?.disconnect();
  io = undefined;
  H();
  wake();
};

/** Install the offscreen / hidden-tab pause (idempotent). Returns an uninstall function. */
export function installOffscreenPause(): () => void {
  if (io === undefined && typeof document == 'object') {
    io =
      typeof IntersectionObserver == 'function'
        ? new IntersectionObserver((es) => {
            for (const e of es) off[e.isIntersecting ? 'delete' : 'add'](e.target);
            wake();
          })
        : null;
    wake = H((el) => document.hidden || (el && off.has(el)), (el) => io?.observe(el));
    document.addEventListener('visibilitychange', wake);
  }
  return un;
}

/** `raf(cb, el)` with the offscreen pause installed. */
export const raf = (cb: FrameRequestCallback, el?: Element): number => (installOffscreenPause(), R(cb, el));

/** `onFrame(fn, el)` with the offscreen pause installed. */
export const onFrame = (fn: (t: number, dt: number) => void, el?: Element): (() => void) => (installOffscreenPause(), F(fn, el));

export { caf } from './base';
