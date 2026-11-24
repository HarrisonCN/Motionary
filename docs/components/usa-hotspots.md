# `<mo-hotspots>` — Image hotspots

> Element name `<mo-hotspots>` (default since 17.3); the legacy name `<usa-hotspots>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pulsing points on a picture; each opens a note, closes with Escape or a click outside.

- **Category:** ui · **since** 17.10
- **Import:** `import { defineHotspots } from 'motionary/components/widgets'` then `defineHotspots();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `pulse`, `label`
- **Events:** `usa:open`, `usa:close`
- **Slots:** —
- **Methods:** `open()`, `close()`
- **Source:** [src/components/widgets/hotspots.ts](../../src/components/widgets/hotspots.ts)

## Minimal example

```html
<mo-hotspots><img src="assets/demo-photo.jpg" alt="Desk"><div data-x="30" data-y="40" data-title="Lamp">Warm light.</div><div data-x="70" data-y="65" data-title="Notebook">Dotted paper.</div></mo-hotspots>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineHotspots } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHotspots(); // registers <mo-hotspots>

/* then use it in your HTML:
<mo-hotspots><img src="assets/demo-photo.jpg" alt="Desk"><div data-x="30" data-y="40" data-title="Lamp">Warm light.</div><div data-x="70" data-y="65" data-title="Notebook">Dotted paper.</div></mo-hotspots>
*/
```
