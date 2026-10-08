/**
 * dist/presets-extended.umd.js — `<script>` build of the extended presets.
 * Adds them to the page-wide preset table shared by every copy of the library
 * (load it before or after dist/index.umd.js). Global: `ScrollAnimatePresets`.
 */
import { EXTENDED_PRESETS, EXTENDED_PRESET_CATEGORIES } from './extended-presets-data';

const g = globalThis as any;
const key = Symbol.for('use-scroll-animate.presets');
g[key] = Object.assign(g[key] || {}, EXTENDED_PRESETS);

export { EXTENDED_PRESETS, EXTENDED_PRESET_CATEGORIES };
