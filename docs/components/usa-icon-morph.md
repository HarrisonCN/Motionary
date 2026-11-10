# `<mo-icon-morph>` — Icon morph

> Element name `<mo-icon-morph>` (default since 17.3); the legacy name `<usa-icon-morph>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Icons that morph point-by-point with a spring: play ↔ pause, menu ↔ close, plus ↔ minus, check, arrow. toggle makes it a button with per-icon labels.

- **Category:** click · **since** 2.5 · **changed in** 6.6
- **Import:** `import { defineIconMorph } from 'motionary/components/click'` then `defineIconMorph();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `icons`, `size`, `toggle`, `index`, `preset`, `labels`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`, `show()`
- **Source:** [src/components/click/icon-morph.ts](../../src/components/click/icon-morph.ts)

## Minimal example

```html
<usa-icon-morph icons="play,pause" labels="Play,Pause" toggle></usa-icon-morph>
<usa-icon-morph icons="menu,close" labels="Open menu,Close menu" toggle></usa-icon-morph>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineIconMorph } from 'motionary/components/click';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineIconMorph(); // registers <mo-icon-morph>

/* then use it in your HTML:
<mo-icon-morph icons="play,pause" labels="Play,Pause" toggle></mo-icon-morph>
<mo-icon-morph icons="menu,close" labels="Open menu,Close menu" toggle></mo-icon-morph>
*/
```
