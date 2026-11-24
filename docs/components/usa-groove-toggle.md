# `<mo-groove-toggle>` — Groove toggle

> Element name `<mo-groove-toggle>` (default since 17.3); the legacy name `<usa-groove-toggle>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A key that sinks into its groove when switched on.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineGrooveToggle } from 'motionary/components/widgets'` then `defineGrooveToggle();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `pressed`, `label`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/groove-toggle.ts](../../src/components/widgets/groove-toggle.ts)

## Minimal example

```html
<mo-groove-toggle label="Pin"></mo-groove-toggle>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineGrooveToggle } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGrooveToggle(); // registers <mo-groove-toggle>

/* then use it in your HTML:
<mo-groove-toggle label="Pin"></mo-groove-toggle>
*/
```
