// Gallery catalog extensions, one module per category added after v2.2 (in display order).
import * as physics from './physics.js';
import * as cards from './cards.js';
import * as click from './click.js';
import * as ui from './ui.js';
import * as page from './page.js';

export const EXTENSIONS = [physics, cards, click, ui, page];

/** item id → (stage, lib, T) => void: live-demo wiring contributed by the extensions. */
export const WIRES = Object.assign({}, ...EXTENSIONS.map((e) => e.wire || {}));
