/**
 * motionary/components/offscreen (13.4) — pauses scheduler work nobody can see.
 *
 * Installs a pause hook on the shared rAF scheduler: every loop / callback waits
 * while the document is hidden, and one given an owner element (`raf(cb, el)`,
 * `onFrame(fn, el)`) also waits while that element is off screen (one shared
 * IntersectionObserver). Widgets and the full bundles install it; the lite
 * bundle does not (lite keeps the frame budget and drop-on-detach only).
 *
 * ```ts
 * import { installOffscreenPause } from 'motionary/components/offscreen';
 * installOffscreenPause();
 * ```
 */
import { raf as baseRaf, onFrame as baseOnFrame, setPauseHook } from './base';

const hiddenEls = new WeakSet<Element>();
let io: IntersectionObserver | undefined;
let installed = false;

/** Install the offscreen / hidden-tab pause (idempotent). Returns an uninstall function. */
export function installOffscreenPause(): () => void {
  if (installed || typeof document == 'undefined') return uninstall;
  installed = true;
  let wake: () => void = () => {};
  const watch = (el: Element) => {
    if (typeof IntersectionObserver == 'undefined') return;
    (io ||= new IntersectionObserver((es) => {
      for (const e of es) e.isIntersecting ? hiddenEls.delete(e.target) : hiddenEls.add(e.target);
      wake();
    })).observe(el);
  };
  wake = setPauseHook((el) => (document.hidden && document.visibilityState == 'hidden') || (el && hiddenEls.has(el)), watch);
  document.addEventListener('visibilitychange', onVis);
  function onVis() {
    wake();
  }
  uninstallFn = () => {
    document.removeEventListener('visibilitychange', onVis);
    setPauseHook();
    io?.disconnect();
    io = undefined;
    installed = false;
    wake();
  };
  return uninstall;
}

let uninstallFn: () => void = () => {};
function uninstall(): void {
  uninstallFn();
}

/** `raf(cb, el)` with the offscreen pause installed. */
export const raf = (cb: FrameRequestCallback, el?: Element): number => (installOffscreenPause(), baseRaf(cb, el));

/** `onFrame(fn, el)` with the offscreen pause installed. */
export const onFrame = (fn: (t: number, dt: number) => void, el?: Element): (() => void) => (installOffscreenPause(), baseOnFrame(fn, el));

export { caf } from './base';
