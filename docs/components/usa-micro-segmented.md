# `<mo-micro-segmented>` — Micro segmented

> Element name `<mo-micro-segmented>` (default since 17.3); the legacy name `<usa-micro-segmented>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The pill slides on two springs: the leading edge is quick, the trailing edge slow, so it stretches toward the new choice.

- **Category:** ui · **since** 17.16
- **Import:** `import { defineMicroSegmented } from 'motionary/components/widgets'` then `defineMicroSegmented();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `options`, `values`, `value`, `label`, `name`, `disabled`, `feel`, `haptics`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/micro-segmented.ts](../../src/components/widgets/micro-segmented.ts)

## Minimal example

```html
<mo-micro-segmented label="View" options="List,Board,Calendar" value="Board"></mo-micro-segmented>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMicroSegmented } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMicroSegmented(); // registers <mo-micro-segmented>

/* then use it in your HTML:
<mo-micro-segmented label="View" options="List,Board,Calendar" value="Board"></mo-micro-segmented>
*/
```
