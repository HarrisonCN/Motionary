# `<usa-gradient-text>` — Gradient flow

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Text filled with a multi-colour gradient that keeps flowing.

- **Category:** text
- **Import:** `import { defineGradientText } from 'motionary/components/text'` then `defineGradientText();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
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
import { defineGradientText } from 'motionary/components/text';

defineGradientText(); // registers <usa-gradient-text>

/* then use it in your HTML:
<usa-gradient-text colors="#7c5cff,#22d3ee,#f472b6">Gradient</usa-gradient-text>
*/
```
