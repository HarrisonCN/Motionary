# `<mo-sweep-lines>` — Sweep lines

> Element name `<mo-sweep-lines>` (default since 17.3); the legacy name `<usa-sweep-lines>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Thin lines sweep across a bar one after another, an indeterminate progress bar.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineSweepLines } from 'motionary/components/widgets'` then `defineSweepLines();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `paused`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/sweep-lines.ts](../../src/components/widgets/sweep-lines.ts)

## Minimal example

```html
<mo-sweep-lines></mo-sweep-lines>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSweepLines } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSweepLines(); // registers <mo-sweep-lines>

/* then use it in your HTML:
<mo-sweep-lines></mo-sweep-lines>
*/
```
