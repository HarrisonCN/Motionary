# `<usa-equalizer>` — Graphic equalizer

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.1: one vertical slider per band with springy caps and a smooth response curve drawn through them; presets glide every band to its gain.

- **Category:** interaction · **since** 7.1
- **Import:** `import { defineEqualizer } from 'motionary/components/widgets'` then `defineEqualizer();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `bands`, `preset`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `applyPreset()`
- **Source:** [src/components/widgets/equalizer.ts](../../src/components/widgets/equalizer.ts)

## Minimal example

```html
<usa-equalizer preset="rock" bands="60,150,400,1k,2.4k,6k,16k"></usa-equalizer>
<script>eq.applyPreset('vocal');</script>
```

## ES module

```js
import { defineEqualizer } from 'motionary/components/widgets';

defineEqualizer(); // registers <usa-equalizer>

/* then use it in your HTML:
<usa-equalizer preset="rock" bands="60,150,400,1k,2.4k,6k,16k"></usa-equalizer>
*/
```
