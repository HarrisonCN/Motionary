# `<usa-dot-network>` — Dot network

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A dot grid that swells and links up with lines around the pointer.

- **Category:** background · **since** 2.8
- **Import:** `import { defineDotNetwork } from 'motionary/components/background'` then `defineDotNetwork();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `gap`, `radius`, `color`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`
- **Source:** [src/components/background/bg-fx.ts](../../src/components/background/bg-fx.ts)

## Minimal example

```html
<usa-dot-network gap="28">…</usa-dot-network>
```

## ES module

```js
import { defineDotNetwork } from 'motionary/components/background';

defineDotNetwork(); // registers <usa-dot-network>

/* then use it in your HTML:
<usa-dot-network gap="28">…</usa-dot-network>
*/
```
