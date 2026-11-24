# `<mo-bulge-volume>` — Bulge volume

> Element name `<mo-bulge-volume>` (default since 17.3); the legacy name `<usa-bulge-volume>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A vertical pill that swells around the finger while you drag the level.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineBulgeVolume } from 'motionary/components/widgets'` then `defineBulgeVolume();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `label`, `disabled`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/bulge-volume.ts](../../src/components/widgets/bulge-volume.ts)

## Minimal example

```html
<mo-bulge-volume label="Volume" value="60"></mo-bulge-volume>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBulgeVolume } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBulgeVolume(); // registers <mo-bulge-volume>

/* then use it in your HTML:
<mo-bulge-volume label="Volume" value="60"></mo-bulge-volume>
*/
```
