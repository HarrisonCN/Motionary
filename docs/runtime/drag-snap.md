# motionary/runtime/drag-snap — Drag, inertia and snap points

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Pointer drag along one axis with velocity tracking, inertial throws, rubber-band edges and spring-animated snap points on the shared ticker — the engine of <usa-snap-carousel>, usable for sheets, sliders and pickers (own implementation).

**Runtime tier:** standard — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **4.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/drag-snap`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/drag-snap.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/drag-snap.js`

4. **Import order & registration:** Register the core first, then the module: use(dragSnap) also registers the core. CDN: load runtime.iife.js, then runtime/drag-snap.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { dragSnap } from 'motionary/runtime/drag-snap';
use(dragSnap);
```

## Example

```js
import { use } from 'motionary/runtime';
import { dragSnap, createDragSnap } from 'motionary/runtime/drag-snap';
use(dragSnap);
const track = document.querySelector('.track');
const ds = createDragSnap(track, { axis: 'x', snap: [0, -320, -640], onUpdate: (x) => (track.style.transform = `translateX(${x}px)`) });
ds.snapTo(1);
```

## Exports

`dragSnap` · `createDragSnap` · `projectThrow` · `nearestSnap` · `rubberband` · `springStep` · `velocityTracker`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| pointer, touch and pen (Pointer Events), drag threshold, pointer capture, touch-action for the other axis | ✅ yes | one axis per controller (x or y) |
| velocity from the last 100 ms, inertial throw with constant deceleration | ✅ yes | off under reduced motion |
| snap points: nearest to the projected throw, a fast flick moves at least one point | ✅ yes |  |
| critically damped spring to the snap point (shared ticker) | ✅ yes | instant under reduced motion |
| bounds with rubber-band resistance | ✅ yes |  |
| clicks inside are kept; the click that ends a drag is swallowed | ✅ yes |  |
| free 2D dragging, scroll-linked snapping (CSS scroll-snap) | ✕ no | use two controllers / native scroll-snap |
| SSR / workers | ◐ partial | the maths (projectThrow, nearestSnap, rubberband, springStep, velocityTracker) is pure |

## Components that need it

- `<usa-snap-carousel>` — Snap carousel (drag · inertia · snap)
