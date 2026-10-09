# `<usa-gen-art>` — Generative artwork

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.3: seeded generative art on a canvas — flow fields, circle packing, Truchet tiles or layered waves in curated palettes; it draws itself in on screen and a tap re-seeds it.

- **Category:** ui · **since** 9.3
- **Import:** `import { defineGenArt } from 'motionary/components/widgets'` then `defineGenArt();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `art`, `seed`, `palette`, `label`
- **Events:** `usa:generate`
- **Slots:** —
- **Methods:** `generate()`, `toDataURL()`
- **Source:** [src/components/widgets/gen-art.ts](../../src/components/widgets/gen-art.ts)

## Minimal example

```html
<usa-gen-art art="flow" seed="7" palette="ocean" style="height:240px"></usa-gen-art>
```

## ES module

```js
import { defineGenArt } from 'motionary/components/widgets';

defineGenArt(); // registers <usa-gen-art>

/* then use it in your HTML:
<usa-gen-art art="flow" seed="7" palette="ocean" style="height:240px"></usa-gen-art>
*/
```
