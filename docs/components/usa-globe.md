# `<usa-globe>` — Spinning globe

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.6: an SVG globe in orthographic projection — graticule, pulsing markers, spins while on screen, drag to turn it, flyTo(name) brings a city round to the front. No WebGL, no tiles.

- **Category:** ui · **since** 7.6
- **Import:** `import { defineGlobe } from 'motionary/components/widgets'` then `defineGlobe();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `markers`, `speed`, `tilt`
- **Events:** `usa:focus`
- **Slots:** —
- **Methods:** `flyTo()`
- **Source:** [src/components/widgets/globe.ts](../../src/components/widgets/globe.ts)

## Minimal example

```html
<usa-globe markers="Shanghai:31.2,121.5; London:51.5,-0.1; New York:40.7,-74"></usa-globe>
<script>globe.flyTo('London');</script>
```

## ES module

```js
import { defineGlobe } from 'motionary/components/widgets';

defineGlobe(); // registers <usa-globe>

/* then use it in your HTML:
<usa-globe markers="Shanghai:31.2,121.5; London:51.5,-0.1; New York:40.7,-74"></usa-globe>
*/
```
