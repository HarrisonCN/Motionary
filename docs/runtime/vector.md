# motionary/runtime/vector — Lottie + dotLottie player

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Plays Lottie (bodymovin JSON) and dotLottie (.lottie) files on Canvas 2D with Motionary’s own renderer (no lottie-web code): shapes, gradients, trim paths, masks, track mattes, precomps, images; a runtime timeline you can seek, reverse and scrub.

Part of Motionary's own zero-dependency runtime. Size budget: **12.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/vector`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/vector.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/vector.js`

4. **Import order & registration:** Register the core first, then the module: use(vector) also registers the core. CDN: load runtime.iife.js, then runtime/vector.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { vector } from 'motionary/runtime/vector';
use(vector);
```

## Example

```js
import { use } from 'motionary/runtime';
import { vector, loadLottie, lottiePlayer } from 'motionary/runtime/vector';
use(vector);
const { animation } = await loadLottie('/anim/hero.lottie');
const player = lottiePlayer(canvas, animation, { loop: true });
player.play();
```

## Exports

`vector` · `evalExpression` · `loadLottie` · `parseDotLottie` · `unzipEntries` · `lottiePlayer` · `renderLottieFrame` · `inspectLottie` · `propValue` · `transformAt` · `trimContours` · `loadLottieImages`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| shape, solid, null, image and precomp layers; parenting; in / out points | ✅ yes | precomp time stretch + time remap |
| transforms: anchor, position (split X / Y, spatial bezier), scale, rotation, skew, opacity | ✅ yes |  |
| paths, rectangles (rounded), ellipses, stars / polygons, groups | ✅ yes |  |
| fills (non-zero / even-odd), strokes (caps, joins, dashes) | ✅ yes |  |
| linear + radial gradient fills / strokes | ✅ yes | highlight length / angle ignored |
| trim paths (individually / simultaneously) | ✅ yes |  |
| masks: add, subtract, intersect, inverted, opacity | ✅ yes |  |
| track mattes: alpha, alpha inverted | ✅ yes | luma mattes approximated by alpha |
| keyframes: per-dimension bezier easing, hold keyframes, v4 + v5 files | ✅ yes |  |
| dotLottie (.lottie): stored + deflate entries, manifest v1 / v2, several animations, embedded images | ✅ yes | deflate needs the native DecompressionStream |
| dotLottie themes + state machines | ✅ yes | 10.9: motionary/runtime/lottie-state + <usa-dotlottie> (subset) |
| markers → named segments | ✅ yes |  |
| text layers: fonts by family + style, justification, tracking, line height, fill / stroke, box text (wrapping), source-text keyframes | ✅ yes | 10.8; system / page fonts (glyph outlines in chars are not used); text animators not supported |
| expressions: time, value, wiggle, loopOut / loopIn (cycle, pingpong, offset, continue), linear / ease, valueAtTime, Math, arithmetic, var / $bm_rt | ✅ yes | 10.8 subset, own interpreter (no eval; CSP-safe); other expressions keep the keyframed value and are listed by inspectLottie() |
| 3D layers, layer effects, merge paths, repeaters | ✕ no | listed by inspectLottie() / el.unsupported |
| dotLottie themes / state machines | ✕ no | planned for 10.9 (subset) |
| SSR / workers | ◐ partial | parsing + unzip are pure; rendering needs a 2D canvas (OffscreenCanvas works) |

## Components that need it

- `<usa-lottie-player>` — Lottie player (JSON + dotLottie)
- `<usa-dotlottie>` — Interactive dotLottie (themes + state machine)
