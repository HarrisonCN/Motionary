/**
 * motionary/components/lite — every component and helper **without
 * inlined CSS** (4.5): each category's stylesheet (`dist/components/<cat>.css`)
 * is loaded on demand the first time one of its elements connects.
 * Same API as `motionary/components`; ~15 KB gzip smaller.
 *
 * ```ts
 * import { defineComponents } from 'motionary/components/lite';
 * defineComponents();            // CSS for <usa-card> loads when the first card mounts
 * ```
 * Override where the CSS comes from with `onDemandStyles(base)`.
 */
import { onDemandStyles } from './perf/index';

export * from './index';
export * from './perf/index';

/** The dist/ folder this module was loaded from. */
export const STYLE_BASE: string = new URL('../', import.meta.url).href;
onDemandStyles(STYLE_BASE);
