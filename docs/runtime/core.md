# motionary/runtime — Runtime core

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Shared ticker (one rAF loop), tween + timeline engine with easing, module registry with clear errors.

**Runtime tier:** basic — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **5.5 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@12/dist/runtime.js`

4. **Import order & registration:** Import motionary/runtime and call use() once at start-up, before any runtime-powered component mounts. CDN: the IIFE registers itself (window.MotionaryRuntime).

```js
import { use } from 'motionary/runtime';
use();
```

## Example

```js
import { use, tween, timeline } from 'motionary/runtime';
use();
tween('.box', { to: { x: 120, opacity: 1 }, duration: 500, ease: 'back-out' });
timeline().to('.a', { to: { y: -20 } }).to('.b', { to: { scale: 1.2 } }, '<+=100');
```

## Exports

`use` · `requireModule` · `hasModule` · `getTicker` · `tween` · `timeline` · `Tween` · `Timeline` · `EASES` · `parseEase` · `cubicBezier` · `steps` · `RuntimeModuleError`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| Plain objects (numeric props) | ✅ yes | any numeric property |
| Elements: CSS lengths, %, unitless, colours, custom properties | ✅ yes | hex, rgb(), rgba(), transparent |
| Transform shorthands x y rotate scale scaleX scaleY skewX skewY | ✅ yes | composed in that order |
| Timeline positions (<, >, +=, -=, labels) | ✅ yes |  |
| repeat / yoyo / reverse / seek / timeScale | ✅ yes |  |
| SSR / Node import | ✅ yes | no window access at import |
| Web Workers | ✅ yes | ticker falls back to setTimeout without rAF |

## Components that need it

- `<usa-plugin-card>` — Plugin detail card
