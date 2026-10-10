# motionary/runtime/format-apng — APNG loader

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Split animated PNGs into standalone frame PNGs (decoded by the browser), composite them (dispose / blend) and play them on a canvas as a runtime timeline.

**Runtime tier:** standard — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **3.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/format-apng`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/format-apng.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/format-apng.js`

4. **Import order & registration:** Register the core first, then the module: use(formatApng) also registers the core. CDN: load runtime.iife.js, then runtime/format-apng.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { formatApng } from 'motionary/runtime/format-apng';
use(formatApng);
```

## Example

```js
import { use } from 'motionary/runtime';
import { formatApng, loadApng, animatedImagePlayer } from 'motionary/runtime/format-apng';
use(formatApng);
const anim = await loadApng('/sticker.png');
animatedImagePlayer(document.querySelector('canvas'), anim);
```

## Exports

`formatApng` · `parseApng` · `apngFramePngs` · `decodeApng` · `loadApng` · `animatedImagePlayer`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| acTL / fcTL / fdAT, frame offsets and delays | ✅ yes |  |
| dispose_op none / background / previous | ✅ yes | first-frame previous → background (spec) |
| blend_op source / over | ✅ yes |  |
| hidden default image (IDAT not part of the animation) | ✅ yes |  |
| palette / tRNS / gAMA / iCCP / sRGB / sBIT copied into frames | ✅ yes |  |
| plain (non-animated) PNG | ✅ yes | one frame |
| decoding | ✅ yes | the browser's PNG decoder (createImageBitmap), or your own { decode } |
| SSR / workers | ◐ partial | parsing is pure; decoding needs createImageBitmap (workers OK) or { decode } |

## Components that need it

_None yet._
