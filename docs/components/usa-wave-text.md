# `<mo-wave-text>` — Wave text

> Element name `<mo-wave-text>` (default since 17.3); the legacy name `<usa-wave-text>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Letters bob in a travelling wave — playful headlines and loading labels.

- **Category:** text · **since** 2.8
- **Import:** `import { defineWaveText } from 'motionary/components/text'` then `defineWaveText();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `text`, `amplitude`, `speed`, `stagger`
- **Events:** —
- **Slots:** —
- **Methods:** `mount()`, `splitChars()`
- **Source:** [src/components/text/text-fx.ts](../../src/components/text/text-fx.ts)

## Minimal example

```html
<usa-wave-text>Loading…</usa-wave-text>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineWaveText } from 'motionary/components/text';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineWaveText(); // registers <mo-wave-text>

/* then use it in your HTML:
<mo-wave-text>Loading…</mo-wave-text>
*/
```
