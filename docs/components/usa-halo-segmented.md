# `<mo-halo-segmented>` — Halo segmented control

> Element name `<mo-halo-segmented>` (default since 17.3); the legacy name `<usa-halo-segmented>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Equal-width radio choices with a sliding glass pill. Arrow keys, Home/End, RTL and disabled support.

- **Category:** ui · **since** 17.4
- **Import:** `import { defineHaloSegmented } from 'motionary/components/widgets'` then `defineHaloSegmented();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `options`, `value`, `label`, `disabled`, `theme`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `changed()`, `mount()`, `luminousTheme()`, `defineMoName()`
- **Source:** [src/components/widgets/halo-segmented.ts](../../src/components/widgets/halo-segmented.ts)

## Minimal example

```html
<mo-halo-segmented options="Studio,Gallery,Export" value="Studio" label="Workspace"></mo-halo-segmented>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineHaloSegmented } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHaloSegmented(); // registers <mo-halo-segmented>

/* then use it in your HTML:
<mo-halo-segmented options="Studio,Gallery,Export" value="Studio" label="Workspace"></mo-halo-segmented>
*/
```
