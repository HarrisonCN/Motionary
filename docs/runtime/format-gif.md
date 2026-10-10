# motionary/runtime/format-gif — GIF decoder

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Decode animated GIFs (own LZW decoder, no DOM) into composited RGBA frames and play / scrub / reverse them on a canvas as a runtime timeline.

**Runtime tier:** standard — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **3.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/format-gif`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/format-gif.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime/format-gif.js`

4. **Import order & registration:** Register the core first, then the module: use(formatGif) also registers the core. CDN: load runtime.iife.js, then runtime/format-gif.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { formatGif } from 'motionary/runtime/format-gif';
use(formatGif);
```

## Example

```js
import { use } from 'motionary/runtime';
import { formatGif, loadGif, animatedImagePlayer } from 'motionary/runtime/format-gif';
use(formatGif);
const gif = await loadGif('/loader.gif');
const player = animatedImagePlayer(document.querySelector('canvas'), gif);
player.pause(); player.progress = 0.5; // scrub
```

## Exports

`formatGif` · `decodeGif` · `loadGif` · `lzwDecode` · `animatedImagePlayer`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| GIF87a / GIF89a | ✅ yes |  |
| global + local palettes, transparency | ✅ yes |  |
| interlaced frames | ✅ yes | 4-pass row order |
| disposal 0–3 (none / keep / background / previous) | ✅ yes | background clears to transparent, like browsers |
| frame delays, NETSCAPE2.0 / ANIMEXTS loop count | ✅ yes | delays ≤ 10 ms play at 100 ms, like browsers |
| truncated files | ◐ partial | decodes what is there |
| plain-text extension | ✕ no | ignored (browsers ignore it too) |
| SSR / workers | ✅ yes | decoding is pure; the player needs a (Offscreen)Canvas |

## Components that need it

_None yet._
