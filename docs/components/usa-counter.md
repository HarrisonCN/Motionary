# `<mo-counter>` — Number counter

> Element name `<mo-counter>` (default since 17.3); the legacy name `<usa-counter>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Counts up to a number when visible, locale-formatted with tabular digits. Set .value to animate live dashboards.

- **Category:** text · **since** 2.2 · **changed in** 6.4
- **Import:** `import { defineCounter } from 'motionary/components/text'` then `defineCounter();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `to`, `decimals`, `locale`, `prefix`, `suffix`, `grouping`, `from`, `start`, `duration`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineCounter } from 'motionary/components/text';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCounter(); // registers <mo-counter>

/* then use it in your HTML:
<mo-counter to="128490" prefix="$" duration="2000"></mo-counter>
*/
```
