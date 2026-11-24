# `<mo-tada-button>` — Tada button

> Element name `<mo-tada-button>` (default since 17.3); the legacy name `<usa-tada-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A toggle button that does a little tada when it turns on.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineTadaButton } from 'motionary/components/widgets'` then `defineTadaButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `pressed`, `label`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/tada-button.ts](../../src/components/widgets/tada-button.ts)

## Minimal example

```html
<mo-tada-button label="Favourite"></mo-tada-button>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTadaButton } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTadaButton(); // registers <mo-tada-button>

/* then use it in your HTML:
<mo-tada-button label="Favourite"></mo-tada-button>
*/
```
