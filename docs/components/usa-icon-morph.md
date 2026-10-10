# `<usa-icon-morph>` — Icon morph

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Icons that morph point-by-point with a spring: play ↔ pause, menu ↔ close, plus ↔ minus, check, arrow. toggle makes it a button with per-icon labels.

- **Category:** click
- **Import:** `import { defineIconMorph } from 'motionary/components/click'` then `defineIconMorph();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
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
import { defineIconMorph } from 'motionary/components/click';

defineIconMorph(); // registers <usa-icon-morph>

/* then use it in your HTML:
<usa-icon-morph icons="play,pause" labels="Play,Pause" toggle></usa-icon-morph>
<usa-icon-morph icons="menu,close" labels="Open menu,Close menu" toggle></usa-icon-morph>
*/
```
