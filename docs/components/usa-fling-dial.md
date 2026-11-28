# `<mo-fling-dial>` — Fling dial

> Element name `<mo-fling-dial>` (default since 17.3); the legacy name `<usa-fling-dial>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A round dial you spin with a finger: a flick keeps it turning, then it clicks into the nearest detent with a short spring and a tick. Options are any list; the arrow keys turn it one detent.

- **Category:** ui · **since** 17.20
- **Import:** `import { defineFlingDial } from 'motionary/components/widgets'` then `defineFlingDial();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `options`, `value`, `label`, `disabled`, `feel`, `haptics`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/fling-dial.ts](../../src/components/widgets/fling-dial.ts)

## Minimal example

```html
<mo-fling-dial options="XS, S, M, L, XL, XXL" value="M" label="Size"></mo-fling-dial>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFlingDial } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFlingDial(); // registers <mo-fling-dial>

/* then use it in your HTML:
<mo-fling-dial options="XS, S, M, L, XL, XXL" value="M" label="Size"></mo-fling-dial>
*/
```
