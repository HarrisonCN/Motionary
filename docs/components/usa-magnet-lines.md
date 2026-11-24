# `<mo-magnet-lines>` — Magnet lines

> Element name `<mo-magnet-lines>` (default since 17.3); the legacy name `<usa-magnet-lines>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A field of short lines that turn toward the pointer like iron filings around a magnet.

- **Category:** background · **since** 17.13
- **Import:** `import { defineMagnetLines } from 'motionary/components/widgets'` then `defineMagnetLines();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `rows`, `columns`, `color`, `angle`, `length`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `later()`, `defineMoName()`
- **Source:** [src/components/widgets/magnet-lines.ts](../../src/components/widgets/magnet-lines.ts)

## Minimal example

```html
<mo-magnet-lines rows="7" columns="10"><strong>Move here</strong></mo-magnet-lines>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMagnetLines } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMagnetLines(); // registers <mo-magnet-lines>

/* then use it in your HTML:
<mo-magnet-lines rows="7" columns="10"><strong>Move here</strong></mo-magnet-lines>
*/
```
