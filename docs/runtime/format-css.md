# motionary/runtime/format-css — CSS @keyframes & WAAPI keyframes loader

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Import CSS @keyframes text or live CSSKeyframesRule objects and Web Animations API keyframes (array or property-indexed) into a runtime timeline.

Part of Motionary's own zero-dependency runtime. Size budget: **2.5 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/format-css`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/format-css.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/format-css.js`

4. **Import order & registration:** Register the core first, then the module: use(formatCss) also registers the core. CDN: load runtime.iife.js, then runtime/format-css.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { formatCss } from 'motionary/runtime/format-css';
use(formatCss);
```

## Example

```js
import { use } from 'motionary/runtime';
import { formatCss, parseKeyframes, playKeyframes } from 'motionary/runtime/format-css';
use(formatCss);
const [pulse] = parseKeyframes('@keyframes pulse { from { opacity: .4 } 50% { opacity: 1; transform: scale(1.1) } to { opacity: .4 } }');
playKeyframes(document.querySelector('.dot'), pulse, { duration: 1200, repeat: -1 });
```

## Exports

`formatCss` · `parseKeyframes` · `fromCssRule` · `fromWaapi` · `toWaapi` · `playKeyframes`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| @keyframes from / to / percentages / selector lists | ✅ yes | duplicate offsets merged, later wins |
| -webkit- / -moz- prefixed @keyframes | ✅ yes |  |
| animation-timing-function per keyframe | ✅ yes | names, cubic-bezier(), steps() |
| transform lists (translate / rotate / scale / skew) | ✅ yes | tweened as shorthands |
| matrix() / 3D transforms | ◐ partial | switch discretely at the segment midpoint |
| WAAPI array + property-indexed keyframes, offsets, easing | ✅ yes | offsets distributed like the WAAPI |
| composite: add / accumulate | ✕ no | ignored (replace) |
| @property typed interpolation | ✕ no | non-numeric values switch discretely |

## Components that need it

_None yet._
