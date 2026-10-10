# `<usa-radar>` — Radar scope

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.4: a sci-fi radar scope — a conic beam sweeps round and each target lights up and fades as the beam passes over it.

- **Category:** ui · **since** 8.4
- **Import:** `import { defineRadar } from 'motionary/components/widgets'` then `defineRadar();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `targets`, `rings`, `speed`, `label`
- **Events:** `usa:ping`
- **Slots:** —
- **Methods:** `setTargets()`
- **Source:** [src/components/widgets/radar.ts](../../src/components/widgets/radar.ts)

## Minimal example

```html
<usa-radar targets="Alpha:40,0.6; Bravo:200,0.35; Echo:300,0.8" speed="4"></usa-radar>
```

## ES module

```js
import { defineRadar } from 'motionary/components/widgets';

defineRadar(); // registers <usa-radar>

/* then use it in your HTML:
<usa-radar targets="Alpha:40,0.6; Bravo:200,0.35; Echo:300,0.8" speed="4"></usa-radar>
*/
```
