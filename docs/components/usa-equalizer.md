# `<mo-equalizer>` — Graphic equalizer

> Element name `<mo-equalizer>` (default since 17.3); the legacy name `<usa-equalizer>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.1: one vertical slider per band with springy caps and a smooth response curve drawn through them; presets glide every band to its gain.

- **Category:** interaction · **since** 7.1
- **Import:** `import { defineEqualizer } from 'motionary/components/widgets'` then `defineEqualizer();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `bands`, `preset`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `applyPreset()`
- **Source:** [src/components/widgets/equalizer.ts](../../src/components/widgets/equalizer.ts)

## Minimal example

```html
<usa-equalizer preset="rock" bands="60,150,400,1k,2.4k,6k,16k"></usa-equalizer>
<script>addEventListener('DOMContentLoaded', () => { const eq = document.querySelector('usa-equalizer'); eq.applyPreset('vocal'); });</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineEqualizer } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineEqualizer(); // registers <mo-equalizer>

/* then use it in your HTML:
<mo-equalizer preset="rock" bands="60,150,400,1k,2.4k,6k,16k"></mo-equalizer>
*/
```
