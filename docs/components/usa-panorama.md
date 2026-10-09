# `<usa-panorama>` — 360° panorama viewer

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.8: a 360° panorama — drag or swipe to look around with inertia, a slow auto-rotate, a compass for the heading and a “View in XR” badge when the browser offers WebXR.

- **Category:** ui · **since** 8.8
- **Import:** `import { definePanorama } from 'motionary/components/widgets'` then `definePanorama();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `src`, `autorotate`, `label`
- **Events:** `usa:xr`, `usa:xr-request`, `usa:look`
- **Slots:** —
- **Methods:** `lookAt()`
- **Source:** [src/components/widgets/panorama.ts](../../src/components/widgets/panorama.ts)

## Minimal example

```html
<usa-panorama src="pano-equirect.jpg" label="Lake at dawn" autorotate="6"></usa-panorama>
```

## ES module

```js
import { definePanorama } from 'motionary/components/widgets';

definePanorama(); // registers <usa-panorama>

/* then use it in your HTML:
<usa-panorama src="pano-equirect.jpg" label="Lake at dawn" autorotate="6"></usa-panorama>
*/
```
