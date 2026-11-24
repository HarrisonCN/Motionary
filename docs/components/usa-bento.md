# `<mo-bento>` — Bento grid

> Element name `<mo-bento>` (default since 17.3); the legacy name `<usa-bento>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A tiled grid whose cells take spans from data-span / data-rows; tiles rise in turn and a soft spotlight follows the pointer.

- **Category:** layout · **since** 17.10
- **Import:** `import { defineBento } from 'motionary/components/widgets'` then `defineBento();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `columns`, `gap`, `collapse`, `stagger`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/bento.ts](../../src/components/widgets/bento.ts)

## Minimal example

```html
<mo-bento columns="3"><div data-span="2">Fast</div><div data-rows="2">Small</div><div>Typed</div><div>Accessible</div></mo-bento>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBento } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBento(); // registers <mo-bento>

/* then use it in your HTML:
<mo-bento columns="3"><div data-span="2">Fast</div><div data-rows="2">Small</div><div>Typed</div><div>Accessible</div></mo-bento>
*/
```
