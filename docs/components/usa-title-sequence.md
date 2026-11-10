# `<usa-title-sequence>` — Title sequence

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Switch between film intertitles with a circular reveal and native disclosure controls.

- **Category:** ui · **since** 17.3
- **Import:** `import { defineTitleSequence } from 'motionary/components/widgets'` then `defineTitleSequence();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** —
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/title-sequence.ts](../../src/components/widgets/title-sequence.ts)

## Minimal example

```html
<usa-title-sequence><details open><summary>First light</summary><p>A film by the coast.</p></details><details><summary>Credits</summary><p>Photography and sound</p></details></usa-title-sequence>
```

## ES module

```js
import { defineTitleSequence } from 'motionary/components/widgets';

defineTitleSequence(); // registers <usa-title-sequence>

/* then use it in your HTML:
<usa-title-sequence><details open><summary>First light</summary><p>A film by the coast.</p></details><details><summary>Credits</summary><p>Photography and sound</p></details></usa-title-sequence>
*/
```
