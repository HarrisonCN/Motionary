# `<mo-center-bars>` — Center bars

> Element name `<mo-center-bars>` (default since 17.3); the legacy name `<usa-center-bars>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Five bars grow and shrink from the middle line in a wave.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineCenterBars } from 'motionary/components/widgets'` then `defineCenterBars();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `paused`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/center-bars.ts](../../src/components/widgets/center-bars.ts)

## Minimal example

```html
<mo-center-bars></mo-center-bars>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCenterBars } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCenterBars(); // registers <mo-center-bars>

/* then use it in your HTML:
<mo-center-bars></mo-center-bars>
*/
```
