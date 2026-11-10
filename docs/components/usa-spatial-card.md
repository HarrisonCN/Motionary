# `<mo-spatial-card>` — Spatial card

> Element name `<mo-spatial-card>` (default since 17.3); the legacy name `<usa-spatial-card>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.8: a spatial-computing window — frosted glass floating in depth, a soft gaze highlight that follows the pointer, layered content and an ornament bar; it eases towards you on hover and sinks on press.

- **Category:** ui · **since** 8.8
- **Import:** `import { defineSpatialCard } from 'motionary/components/widgets'` then `defineSpatialCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** —
- **Events:** `usa:focus-depth`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/spatial-card.ts](../../src/components/widgets/spatial-card.ts)

## Minimal example

```html
<usa-spatial-card>
  <h3 data-depth="2">Photos</h3>
  <p data-depth="1">Spatial window</p>
  <nav slot="ornament"><button>⟲</button><button>♡</button></nav>
</usa-spatial-card>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpatialCard } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpatialCard(); // registers <mo-spatial-card>

/* then use it in your HTML:
<mo-spatial-card>
  <h3 data-depth="2">Photos</h3>
  <p data-depth="1">Spatial window</p>
  <nav slot="ornament"><button>⟲</button><button>♡</button></nav>
</mo-spatial-card>
*/
```
