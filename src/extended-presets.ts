/**
 * `motionary/presets/extended` — "Scroll presets 2.0" (6.1).
 *
 * 181 extra scroll-reveal presets (fades with distances and diagonals, zooms,
 * 3D flips and doors, overshoot slides, back-in / light-speed, roll / spiral /
 * skew, blur & mask reveals, clip-path shapes, bounce & elastic entrances,
 * colour & light, depth & perspective, glitch / typewriter, stagger-ready and
 * scroll-linked `scrub-*` presets). Importing this entry registers them, so
 * the names work with `animation`, `data-sa-animation`, the framework hooks,
 * `<scroll-animate>` and `<usa-reveal effect>`. Kept out of the core bundle.
 *
 * ```js
 * import 'motionary/presets/extended';
 * ScrollAnimate.observe('.card', { animation: 'bounce-in-up' });
 * ```
 */
import { registerPresets } from './presets';
import { EXTENDED_PRESETS, EXTENDED_PRESET_CATEGORIES } from './extended-presets-data';

registerPresets(EXTENDED_PRESETS);

/** Register the extended presets again (e.g. after replacing one). Idempotent. */
export function registerExtendedPresets(): void {
  registerPresets(EXTENDED_PRESETS);
}

export { EXTENDED_PRESETS, EXTENDED_PRESET_CATEGORIES };
export type { ExtendedPreset, PresetKeyframes } from './types';
