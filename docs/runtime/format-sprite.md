# motionary/runtime/format-sprite — Sprite sheets & image sequences

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Play TexturePacker / Aseprite sprite sheets and numbered image sequences on a canvas or an element background, as runtime timelines (scrubbable).

**Runtime tier:** standard — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **3.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/format-sprite`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime/format-sprite.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime/format-sprite.js`

4. **Import order & registration:** Register the core first, then the module: use(formatSprite) also registers the core. CDN: load runtime.iife.js, then runtime/format-sprite.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { formatSprite } from 'motionary/runtime/format-sprite';
use(formatSprite);
```

## Example

```js
import { use } from 'motionary/runtime';
import { formatSprite, parseSpriteSheet, spritePlayer } from 'motionary/runtime/format-sprite';
use(formatSprite);
const sheet = parseSpriteSheet(await (await fetch('/slime.json')).json());
const img = new Image(); img.src = '/slime.png'; await img.decode();
spritePlayer(document.querySelector('canvas'), sheet, img, { tag: 'bounce' });
```

## Exports

`formatSprite` · `parseSpriteSheet` · `gridSheet` · `frameOrder` · `drawFrame` · `spritePlayer` · `imageSequence` · `preloadImages` · `sequencePlayer`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| TexturePacker JSON (hash + array) | ✅ yes | trimmed (spriteSourceSize / sourceSize) and rotated frames |
| Aseprite JSON (hash + array), per-frame duration | ✅ yes |  |
| Aseprite frameTags: forward / reverse / pingpong / pingpong_reverse | ✅ yes |  |
| plain grid sheets | ✅ yes | gridSheet(cols, rows, w, h) |
| image sequences (frame_{0001}.webp) | ✅ yes | preloading, cover-fit drawing, scrub via progress |
| multipack (several atlas images) | ✕ no | load each sheet separately |
| Aseprite slices / layers | ✕ no | frames only |
| SSR / workers | ◐ partial | parsing is pure; players need a canvas (OffscreenCanvas works) |

## Components that need it

_None yet._
