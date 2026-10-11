declare const caf: (id: number) => void;

/** Install the offscreen / hidden-tab pause (idempotent). Returns an uninstall function. */
declare function installOffscreenPause(): () => void;
/** `raf(cb, el)` with the offscreen pause installed. */
declare const raf: (cb: FrameRequestCallback, el?: Element) => number;
/** `onFrame(fn, el)` with the offscreen pause installed. */
declare const onFrame: (fn: (t: number, dt: number) => void, el?: Element) => (() => void);

export { caf, installOffscreenPause, onFrame, raf };
