# `<mo-spinner>` — Spinners

> Element name `<mo-spinner>` (default since 17.3); the legacy name `<usa-spinner>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Six indeterminate indicators: the WinUI progress ring, the Windows 10 orbiting dots, ring, typing dots, pulse and bars.

- **Category:** feedback · **since** 2.2 · **changed in** 2.9, 3.0
- **Import:** `import { defineSpinner } from 'motionary/components/feedback'` then `defineSpinner();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `kind`, `size`, `label`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/feedback/spinner.ts](../../src/components/feedback/spinner.ts)

## Minimal example

```html
<usa-spinner kind="fluent"></usa-spinner>
<usa-spinner kind="windows" size="40"></usa-spinner>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpinner } from 'motionary/components/feedback';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpinner(); // registers <mo-spinner>

/* then use it in your HTML:
<mo-spinner kind="fluent"></mo-spinner>
<mo-spinner kind="windows" size="40"></mo-spinner>
*/
```
