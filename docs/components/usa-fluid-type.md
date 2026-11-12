# `<mo-fluid-type>` — Fluid type

> Element name `<mo-fluid-type>` (default since 17.3); the legacy name `<usa-fluid-type>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Supplied text becomes a halftone vessel with a tilting liquid surface.

- **Category:** text · **since** 17.6
- **Import:** `import { defineFluidType } from 'motionary/components/widgets'` then `defineFluidType();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `disabled`, `animated`, `paused`, `color`, `accent`, `text`, `fill`
- **Events:** `usa:action`, `usa:change`
- **Slots:** —
- **Methods:** `update()`, `reset()`, `play()`, `pause()`, `activate()`, `deactivate()`
- **Source:** [src/components/widgets/fluid-type.ts](../../src/components/widgets/fluid-type.ts)

## Minimal example

```html
<mo-fluid-type animated></mo-fluid-type>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFluidType } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFluidType(); // registers <mo-fluid-type>

/* then use it in your HTML:
<mo-fluid-type animated></mo-fluid-type>
*/
```
