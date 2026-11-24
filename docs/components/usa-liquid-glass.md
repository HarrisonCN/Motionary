# `<mo-liquid-glass>` — Liquid glass

> Element name `<mo-liquid-glass>` (default since 17.3); the legacy name `<usa-liquid-glass>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A glass pane that blurs and bends what is behind it, catches a highlight under the pointer and squashes on press.

- **Category:** depth · **since** 17.10
- **Import:** `import { defineLiquidGlass } from 'motionary/components/widgets'` then `defineLiquidGlass();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `strength`, `blur`, `tint`, `radius`, `pressable`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/liquid-glass.ts](../../src/components/widgets/liquid-glass.ts)

## Minimal example

```html
<mo-liquid-glass pressable><strong>Liquid glass</strong></mo-liquid-glass>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineLiquidGlass } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLiquidGlass(); // registers <mo-liquid-glass>

/* then use it in your HTML:
<mo-liquid-glass pressable><strong>Liquid glass</strong></mo-liquid-glass>
*/
```
