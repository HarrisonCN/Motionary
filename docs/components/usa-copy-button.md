# `<mo-copy-button>` — <usa-copy-button>

> Element name `<mo-copy-button>` (default since 17.3); the legacy name `<usa-copy-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A copy-to-clipboard button whose two squares redraw into a tick and whose label rolls to "Copied", then back. The text comes from the `text` attribute, or from the element named by `for` (its value or text content). A native button handles pointer and keyboard; the outcome is announced through a polite live region.

- **Category:** widgets
- **Import:** `import { defineCopyButton } from 'motionary/components/widgets'` then `defineCopyButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `text`, `for`, `label`, `done-label`, `fail-label`, `duration`, `disabled`
- **Events:** `usa:copy`
- **Slots:** —
- **Methods:** `copy()`
- **Source:** [src/components/widgets/copy-button.ts](../../src/components/widgets/copy-button.ts)

## Minimal example

```html
<usa-copy-button></usa-copy-button>
```
