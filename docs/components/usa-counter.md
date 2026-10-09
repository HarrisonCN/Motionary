# `<usa-counter>` — Number counter

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Counts up to a number when visible, locale-formatted with tabular digits. Set .value to animate live dashboards.

- **Category:** text
- **Import:** `import { defineCounter } from 'motionary/components/text'` then `defineCounter();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** `to`, `decimals`, `locale`, `prefix`, `suffix`, `grouping`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `play()`, `format()`
- **Source:** [src/components/text/counter.ts](../../src/components/text/counter.ts)

## Minimal example

```html
<usa-counter to="128490" prefix="$" duration="2000"></usa-counter>
```

## ES module

```js
import { defineCounter } from 'motionary/components/text';

defineCounter(); // registers <usa-counter>

/* then use it in your HTML:
<usa-counter to="128490" prefix="$" duration="2000"></usa-counter>
*/
```
