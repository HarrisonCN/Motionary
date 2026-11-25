# `<mo-toggle-group>` — Toggle group

> Element name `<mo-toggle-group>` (default since 17.3); the legacy name `<usa-toggle-group>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A row of toggle buttons, one at a time or several, with arrow-key focus and an optional hidden input.

- **Category:** ui · **since** 17.15
- **Import:** `import { defineToggleGroup } from 'motionary/components/widgets'` then `defineToggleGroup();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `options`, `values`, `value`, `multiple`, `required`, `name`, `label`, `size`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/toggle-group.ts](../../src/components/widgets/toggle-group.ts)

## Minimal example

```html
<mo-toggle-group options="Day,Week,Month" value="Week" required></mo-toggle-group>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineToggleGroup } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineToggleGroup(); // registers <mo-toggle-group>

/* then use it in your HTML:
<mo-toggle-group options="Day,Week,Month" value="Week" required></mo-toggle-group>
*/
```
