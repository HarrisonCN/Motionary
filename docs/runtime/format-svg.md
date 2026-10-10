# motionary/runtime/format-svg — SVG loader: SMIL playback + path morphing

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Replay SVG SMIL animations (animate, set, animateTransform, animateMotion) on the runtime timeline, morph between any two paths, and measure paths without the DOM.

**Runtime tier:** standard — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **5.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/format-svg`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/format-svg.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/format-svg.js`

4. **Import order & registration:** Register the core first, then the module: use(formatSvg) also registers the core. CDN: load runtime.iife.js, then runtime/format-svg.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { formatSvg } from 'motionary/runtime/format-svg';
use(formatSvg);
```

## Example

```js
import { use } from 'motionary/runtime';
import { formatSvg, playSmil, morphPath } from 'motionary/runtime/format-svg';
use(formatSvg);
const player = playSmil(document.querySelector('svg'));
player.timeline.timeScale = 0.5;   // scrub / slow down / reverse like any runtime timeline
const f = morphPath('M0 0 L100 0 L50 80 Z', 'M50 0 A40 40 0 1 1 49.9 0 Z');
path.setAttribute('d', f(0.5));
```

## Exports

`formatSvg` · `playSmil` · `readSmil` · `morphPath` · `parsePath` · `flattenPath` · `pathLength` · `pointAtLength` · `samplePath` · `smilTime`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| <animate> from / to / by / values, keyTimes, calcMode linear / discrete / spline + keySplines | ✅ yes |  |
| <set> | ✅ yes |  |
| <animateTransform> translate / scale / rotate / skewX / skewY | ✅ yes |  |
| <animateMotion> path / <mpath>, rotate auto / auto-reverse / angle | ✅ yes | paced along the path |
| dur, numeric begin offsets, repeatCount (incl. indefinite), repeatDur, fill freeze | ✅ yes |  |
| path morphing between any two paths (d attribute or morphPath()) | ✅ yes | resampled to N points, start points aligned |
| path parsing incl. relative commands, S/T reflections, arcs | ✅ yes | no DOM needed (SSR / workers) |
| event / syncbase begin (click, a.end), accumulate, additive="sum" | ✕ no | documented gap |
| CSS-animated SVG | ✅ yes | via motionary/runtime/format-css |

## Components that need it

_None yet._
