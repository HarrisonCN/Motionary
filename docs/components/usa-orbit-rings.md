# `<mo-orbit-rings>` — Orbit rings

> Element name `<mo-orbit-rings>` (default since 17.3); the legacy name `<usa-orbit-rings>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Icons circling a center on up to three rings, kept upright; pauses on hover.

- **Category:** depth · **since** 17.12
- **Import:** `import { defineOrbitRings } from 'motionary/components/widgets'` then `defineOrbitRings();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `radius`, `duration`, `label`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/orbit-rings.ts](../../src/components/widgets/orbit-rings.ts)

## Minimal example

```html
<mo-orbit-rings radius="60"><strong data-center>Core</strong><span>JS</span><span>CSS</span><span>SVG</span><span data-ring="2">GL</span><span data-ring="2">TS</span></mo-orbit-rings>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineOrbitRings } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineOrbitRings(); // registers <mo-orbit-rings>

/* then use it in your HTML:
<mo-orbit-rings radius="60"><strong data-center>Core</strong><span>JS</span><span>CSS</span><span>SVG</span><span data-ring="2">GL</span><span data-ring="2">TS</span></mo-orbit-rings>
*/
```
