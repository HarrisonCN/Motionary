# `<mo-download-button>` — Download button

> Element name `<mo-download-button>` (default since 17.3); the legacy name `<usa-download-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A button that fills with progress, reads it out in tens and ends on a drawn tick.

- **Category:** click · **since** 17.11
- **Import:** `import { defineDownloadButton } from 'motionary/components/widgets'` then `defineDownloadButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `done-label`, `progress`, `duration`, `once`
- **Events:** `usa:done`, `usa:start`
- **Slots:** —
- **Methods:** `reset()`
- **Source:** [src/components/widgets/download-button.ts](../../src/components/widgets/download-button.ts)

## Minimal example

```html
<mo-download-button duration="2400"></mo-download-button>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineDownloadButton } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDownloadButton(); // registers <mo-download-button>

/* then use it in your HTML:
<mo-download-button duration="2400"></mo-download-button>
*/
```
