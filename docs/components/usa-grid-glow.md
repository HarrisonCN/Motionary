# `<usa-grid-glow>` — Grid glow

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A line grid behind the content that lights up around the pointer.

- **Category:** background
- **Import:** `import { defineGridGlow } from 'motionary/components/background'` then `defineGridGlow();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`
- **Source:** [src/components/background/bg-fx.ts](../../src/components/background/bg-fx.ts)

## Minimal example

```html
<usa-grid-glow size="32">
  <h2>Hero</h2>
</usa-grid-glow>
```

## ES module

```js
import { defineGridGlow } from 'motionary/components/background';

defineGridGlow(); // registers <usa-grid-glow>

/* then use it in your HTML:
<usa-grid-glow size="32">
  <h2>Hero</h2>
</usa-grid-glow>
*/
```
