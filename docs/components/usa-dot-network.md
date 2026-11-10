# `<mo-dot-network>` — Dot network

> Element name `<mo-dot-network>` (default since 17.3); the legacy name `<usa-dot-network>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A dot grid that swells and links up with lines around the pointer.

- **Category:** background · **since** 2.8
- **Import:** `import { defineDotNetwork } from 'motionary/components/background'` then `defineDotNetwork();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineDotNetwork } from 'motionary/components/background';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDotNetwork(); // registers <mo-dot-network>

/* then use it in your HTML:
<mo-dot-network gap="28">…</mo-dot-network>
*/
```
