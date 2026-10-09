# motionary/runtime/format-motion — Motion / Framer keyframe JSON loader

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Play Motion / Framer-style { initial, animate, transition } JSON (arrays as keyframes, times, repeatType, springs) with the runtime.

Part of Motionary's own zero-dependency runtime. Size budget: **2.5 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/format-motion`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/format-motion.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/format-motion.js`

4. **Import order & registration:** Register the core first, then the module: use(formatMotion) also registers the core. CDN: load runtime.iife.js, then runtime/format-motion.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { formatMotion } from 'motionary/runtime/format-motion';
use(formatMotion);
```

## Example

```js
import { use } from 'motionary/runtime';
import { formatMotion, playMotion } from 'motionary/runtime/format-motion';
use(formatMotion);
playMotion(document.querySelector('.card'), { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { type: 'spring', stiffness: 180, damping: 14 } });
```

## Exports

`formatMotion` · `fromMotion` · `playMotion` · `springEase` · `motionEase`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| initial / animate, arrays as keyframes, times | ✅ yes |  |
| transition duration / delay (s), ease names + cubic arrays | ✅ yes | easeIn/Out/InOut, circ*, back*, anticipate≈back-in-out |
| repeat (Infinity), repeatType loop / reverse / mirror | ✅ yes | mirror = reverse |
| per-property transitions | ✅ yes |  |
| type: "spring" (stiffness, damping, mass, bounce + duration) | ✅ yes | simulated into an easing curve |
| variants, gestures (whileHover…), layout animations | ✕ no | out of scope |

## Components that need it

_None yet._
