// Gallery catalog extensions, one module per category added after v2.2 (in display order).
import * as physics from './physics.js';
import * as cards from './cards.js';
import * as click from './click.js';
import * as ui from './ui.js';
import * as page from './page.js';
import * as v28 from './text-bg-fluent.js';
import * as timeline from './timeline.js';
import * as gesture from './gesture.js';
import * as svg from './svg.js';

export const EXTENSIONS = [physics, cards, click, ui, page, v28, timeline, gesture, svg];

/** item id → (stage, lib, T) => void: live-demo wiring contributed by the extensions. */
export const WIRES = Object.assign({}, ...EXTENSIONS.map((e) => e.wire || {}));
