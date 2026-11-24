# `<mo-transfer-button>` — Transfer button

> Element name `<mo-transfer-button>` (default since 17.3); the legacy name `<usa-transfer-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A squishy download / upload key with a progress ring that turns into a tick at 100.

- **Category:** click · **since** 17.9
- **Import:** `import { defineTransferButton } from 'motionary/components/widgets'` then `defineTransferButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `direction`, `label`, `progress`, `disabled`
- **Events:** `usa:complete`, `usa:transfer`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/transfer-button.ts](../../src/components/widgets/transfer-button.ts)

## Minimal example

```html
<mo-transfer-button direction="download"></mo-transfer-button> <mo-transfer-button direction="upload"></mo-transfer-button>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTransferButton } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTransferButton(); // registers <mo-transfer-button>

/* then use it in your HTML:
<mo-transfer-button direction="download"></mo-transfer-button> <mo-transfer-button direction="upload"></mo-transfer-button>
*/
```
