# motionary/runtime/scroll — Scroll scenes

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Scroll-linked scenes: start / end rules, scrub (direct or smoothed), pin, markers, enter / leave callbacks and per-edge actions for a runtime tween or timeline.

Part of Motionary's own zero-dependency runtime. Size budget: **4.5 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/scroll`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime/scroll.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime/scroll.js`

4. **Import order & registration:** Register the core first, then the module: use(scroll) also registers the core. CDN: load runtime.iife.js, then runtime/scroll.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { scroll } from 'motionary/runtime/scroll';
use(scroll);
```

## Example

```js
import { use, timeline } from 'motionary/runtime';
import { scroll, scrollScene } from 'motionary/runtime/scroll';
use(scroll);
const tl = timeline({ paused: true }).to('.card', { to: { x: 200, rotate: 8 } });
scrollScene({ trigger: '.section', start: 'top 80%', end: 'bottom 20%', scrub: 120, pin: true, markers: true, animation: tl });
```

## Exports

`scroll` · `scrollScene` · `ScrollScene` · `refreshScenes` · `killScenes` · `allScenes` · `parseEdge` · `resolveRule`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| start / end rules ("top 80%", "center center", "top top+=80", end "+=600") | ✅ yes | keywords, %, px, +=/-= offsets |
| scrub: direct (true) or smoothed (ms) | ✅ yes | drives any runtime tween / timeline |
| pin (fixed in the window, transform inside a scroll container) | ✅ yes | spacer keeps the layout |
| markers | ✅ yes | start / end + viewport lines |
| onEnter / onLeave / onEnterBack / onLeaveBack / onUpdate / onToggle | ✅ yes |  |
| actions per edge (play pause resume reverse restart reset complete none) | ✅ yes | default "play none none reverse" |
| horizontal scenes, custom scroll containers | ✅ yes |  |
| snap, nested pins, pinned scroll containers | ✕ no | planned with the smooth module (10.4) |
| SSR | ✅ yes | safe to import; scenes need a window |
| Web Workers | ✕ no | needs the DOM |

## Components that need it

- `<usa-scroll-scene>` — Scroll scene
