# `<mo-jelly-button>` — Jelly button

> Element name `<mo-jelly-button>` (default since 17.3); the legacy name `<usa-jelly-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A button that wobbles like jelly when pressed.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineJellyButton } from 'motionary/components/widgets'` then `defineJellyButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `glyph`, `disabled`
- **Events:** `usa:press`
- **Slots:** —
- **Methods:** `press()`
- **Source:** [src/components/widgets/jelly-button.ts](../../src/components/widgets/jelly-button.ts)

## Minimal example

```html
<mo-jelly-button label="Add"></mo-jelly-button>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineJellyButton } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineJellyButton(); // registers <mo-jelly-button>

/* then use it in your HTML:
<mo-jelly-button label="Add"></mo-jelly-button>
*/
```
