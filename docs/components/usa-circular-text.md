# `<mo-circular-text>` — Circular text

> Element name `<mo-circular-text>` (default since 17.3); the legacy name `<usa-circular-text>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Text set around a slowly turning ring, with any content in the middle; hover slows, speeds or reverses it.

- **Category:** text · **since** 17.13
- **Import:** `import { defineCircularText } from 'motionary/components/widgets'` then `defineCircularText();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `text`, `separator`, `duration`, `direction`, `hover`, `size`, `color`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/circular-text.ts](../../src/components/widgets/circular-text.ts)

## Minimal example

```html
<mo-circular-text text="Scroll down · Scroll down"><span>↓</span></mo-circular-text>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCircularText } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCircularText(); // registers <mo-circular-text>

/* then use it in your HTML:
<mo-circular-text text="Scroll down · Scroll down"><span>↓</span></mo-circular-text>
*/
```
