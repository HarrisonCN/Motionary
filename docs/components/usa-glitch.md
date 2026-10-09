# `<usa-glitch>` — Glitch text

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An RGB-split, sliced glitch — always on or on hover.

- **Category:** text
- **Import:** `import { defineGlitch } from 'motionary/components/text'` then `defineGlitch();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** `text`, `intensity`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `splitChars()`
- **Source:** [src/components/text/text-fx.ts](../../src/components/text/text-fx.ts)

## Minimal example

```html
<usa-glitch trigger="hover">SYSTEM ERROR</usa-glitch>
```

## ES module

```js
import { defineGlitch } from 'motionary/components/text';

defineGlitch(); // registers <usa-glitch>

/* then use it in your HTML:
<usa-glitch trigger="hover">SYSTEM ERROR</usa-glitch>
*/
```
