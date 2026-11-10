# `<mo-gen-art>` — Generative artwork

> Element name `<mo-gen-art>` (default since 17.3); the legacy name `<usa-gen-art>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.3: seeded generative art on a canvas — flow fields, circle packing, Truchet tiles or layered waves in curated palettes; it draws itself in on screen and a tap re-seeds it.

- **Category:** ui · **since** 9.3
- **Import:** `import { defineGenArt } from 'motionary/components/widgets'` then `defineGenArt();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineGenArt } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGenArt(); // registers <mo-gen-art>

/* then use it in your HTML:
<mo-gen-art art="flow" seed="7" palette="ocean" style="height:240px"></mo-gen-art>
*/
```
