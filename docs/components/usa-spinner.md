# `<usa-spinner>` — Spinners

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Six indeterminate indicators: the WinUI progress ring, the Windows 10 orbiting dots, ring, typing dots, pulse and bars.

- **Category:** feedback
- **Import:** `import { defineSpinner } from 'motionary/components/feedback'` then `defineSpinner();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
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
import { defineSpinner } from 'motionary/components/feedback';

defineSpinner(); // registers <usa-spinner>

/* then use it in your HTML:
<usa-spinner kind="fluent"></usa-spinner>
<usa-spinner kind="windows" size="40"></usa-spinner>
*/
```
