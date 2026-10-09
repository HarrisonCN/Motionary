# motionary/runtime/smooth — Smooth scrolling

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Smooth, inertial wheel scrolling (lerp or fixed-duration glide) for the window or any scroll container, anchor links that glide, off under prefers-reduced-motion; real scroll events keep scroll scenes and observers working.

**Runtime tier:** standard — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **3.5 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/smooth`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/smooth.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/smooth.js`

4. **Import order & registration:** Register the core first, then the module: use(smooth) also registers the core. CDN: load runtime.iife.js, then runtime/smooth.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { smooth } from 'motionary/runtime/smooth';
use(smooth);
```

## Example

```js
import { use } from 'motionary/runtime';
import { smooth, smoothScroll } from 'motionary/runtime/smooth';
use(smooth);
const s = smoothScroll({ lerp: 0.1, anchors: { offset: -64 } });
s.scrollTo('#pricing');
```

## Exports

`smooth` · `smoothScroll` · `SmoothScroll` · `allSmooth`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| wheel / trackpad smoothing (lerp, or duration + ease) | ✅ yes | frame-rate independent |
| window and scroll containers (wrapper), vertical / horizontal | ✅ yes |  |
| keyboard, scrollbar, find-in-page, assistive tech | ✅ yes | stay native; the smoothed target follows them |
| touch | ◐ partial | native momentum by default; touch: true smooths it |
| anchor links (#id) with offset, focus moved, URL hash kept | ✅ yes |  |
| nested scrollables, [data-smooth-ignore], ctrl+wheel zoom | ✅ yes | left native |
| prefers-reduced-motion | ✅ yes | disabled while it matches (re-enabled live) |
| scroll scenes / IntersectionObserver / CSS scroll timelines | ✅ yes | real scroll events still fire |
| SSR / workers | ◐ partial | import is safe; smoothScroll() needs a browser |

## Components that need it

- `<usa-smooth-scroll>` — Smooth scroll
