// Gallery catalog extensions, one module per category added after v2.2 (in display order).
import * as physics from './physics.js';

export const EXTENSIONS = [physics];

/** item id → (stage, lib, T) => void: live-demo wiring contributed by the extensions. */
export const WIRES = Object.assign({}, ...EXTENSIONS.map((e) => e.wire || {}));
