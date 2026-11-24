# `<mo-squish-indicator>` — Squish indicator

> Element name `<mo-squish-indicator>` (default since 17.3); the legacy name `<usa-squish-indicator>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Round soft keys where the picked one swells on a spring; a native radio group.

- **Category:** click · **since** 17.9
- **Import:** `import { defineSquishIndicator } from 'motionary/components/widgets'` then `defineSquishIndicator();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `options`, `value`, `label`, `name`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/squish-indicator.ts](../../src/components/widgets/squish-indicator.ts)

## Minimal example

```html
<mo-squish-indicator options="A,B,C" value="B"></mo-squish-indicator>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSquishIndicator } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSquishIndicator(); // registers <mo-squish-indicator>

/* then use it in your HTML:
<mo-squish-indicator options="A,B,C" value="B"></mo-squish-indicator>
*/
```
