# `<mo-transfer-button>` — <usa-transfer-button>

> Element name `<mo-transfer-button>` (default since 17.3); the legacy name `<usa-transfer-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A squishy download / upload key. Pressing it hops the arrow toward the tray and asks the page to start the transfer; the page then reports progress through the `progress` attribute, which fills a ring around the key. At 100 the arrow turns into a tick and `usa:complete` fires once. A native button handles pointer and keyboard; progress is announced through a polite live region.

- **Category:** widgets
- **Import:** `import { defineTransferButton } from 'motionary/components/widgets'` then `defineTransferButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `direction`, `label`, `progress`, `disabled`
- **Events:** `usa:complete`, `usa:transfer`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/transfer-button.ts](../../src/components/widgets/transfer-button.ts)

## Minimal example

```html
<usa-transfer-button></usa-transfer-button>
```
