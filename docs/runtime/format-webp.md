# motionary/runtime/format-webp — Animated WebP loader

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Split animated WebP files (ANIM / ANMF) into standalone frames (decoded by the browser), composite them (blend / dispose) and play them on a canvas as a runtime timeline.

**Runtime tier:** standard — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **3.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/format-webp`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/format-webp.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/format-webp.js`

4. **Import order & registration:** Register the core first, then the module: use(formatWebp) also registers the core. CDN: load runtime.iife.js, then runtime/format-webp.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { formatWebp } from 'motionary/runtime/format-webp';
use(formatWebp);
```

## Example

```js
import { use } from 'motionary/runtime';
import { formatWebp, loadWebp, animatedImagePlayer } from 'motionary/runtime/format-webp';
use(formatWebp);
const anim = await loadWebp('/hero.webp');
const p = animatedImagePlayer(document.querySelector('canvas'), anim, { speed: 0.5 });
```

## Exports

`formatWebp` · `parseWebp` · `webpFrameFiles` · `decodeWebp` · `loadWebp` · `animatedImagePlayer`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| VP8X + ANIM + ANMF frames, offsets, durations, loop count | ✅ yes |  |
| lossy (VP8) with alpha (ALPH) and lossless (VP8L) frames | ✅ yes | lossy + alpha frames get their own VP8X header |
| blending on / off, dispose none / background | ✅ yes | composited on transparent, like browsers |
| still WebP (simple and extended) | ✅ yes | one frame |
| ICC / EXIF / XMP metadata | ✕ no | ignored |
| browsers without WebP decoding | ✕ no | fall back to <img> |
| SSR / workers | ◐ partial | parsing is pure; decoding needs createImageBitmap (workers OK) or { decode } |

## Components that need it

_None yet._
