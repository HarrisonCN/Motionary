# `<mo-title-sequence>` — Title sequence

> Element name `<mo-title-sequence>` (default since 17.3); the legacy name `<usa-title-sequence>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

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
<mo-title-sequence><details open><summary>First light</summary><p>A film by the coast.</p></details><details><summary>Credits</summary><p>Photography and sound</p></details></mo-title-sequence>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTitleSequence } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTitleSequence(); // registers <mo-title-sequence>

/* then use it in your HTML:
<mo-title-sequence><details open><summary>First light</summary><p>A film by the coast.</p></details><details><summary>Credits</summary><p>Photography and sound</p></details></mo-title-sequence>
*/
```
