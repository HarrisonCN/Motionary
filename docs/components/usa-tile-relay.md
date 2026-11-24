# `<mo-tile-relay>` — Tile relay

> Element name `<mo-tile-relay>` (default since 17.3); the legacy name `<usa-tile-relay>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A highlight is handed from tile to tile around a small grid; pure CSS, paused off screen.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineTileRelay } from 'motionary/components/widgets'` then `defineTileRelay();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `size`, `duration`, `label`, `paused`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/tile-relay.ts](../../src/components/widgets/tile-relay.ts)

## Minimal example

```html
<mo-tile-relay size="3" label="Loading photos"></mo-tile-relay>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTileRelay } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTileRelay(); // registers <mo-tile-relay>

/* then use it in your HTML:
<mo-tile-relay size="3" label="Loading photos"></mo-tile-relay>
*/
```
