# `<mo-gradient-text>` — Gradient flow

> Element name `<mo-gradient-text>` (default since 17.3); the legacy name `<usa-gradient-text>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Text filled with a multi-colour gradient that keeps flowing.

- **Category:** text · **since** 2.8
- **Import:** `import { defineGradientText } from 'motionary/components/text'` then `defineGradientText();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `colors`, `speed`, `angle`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `splitChars()`
- **Source:** [src/components/text/text-fx.ts](../../src/components/text/text-fx.ts)

## Minimal example

```html
<usa-gradient-text colors="#7c5cff,#22d3ee,#f472b6">Gradient</usa-gradient-text>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineGradientText } from 'motionary/components/text';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGradientText(); // registers <mo-gradient-text>

/* then use it in your HTML:
<mo-gradient-text colors="#7c5cff,#22d3ee,#f472b6">Gradient</mo-gradient-text>
*/
```
