# `<mo-sidebar>` — Collapsible sidebar

> Element name `<mo-sidebar>` (default since 17.3); the legacy name `<usa-sidebar>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Navigation that folds to an icon rail; a pill glides to the current item and labels fade out as it narrows.

- **Category:** ui · **since** 17.10
- **Import:** `import { defineSidebar } from 'motionary/components/widgets'` then `defineSidebar();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `collapsed`, `expand-label`, `collapse-label`
- **Events:** `usa:toggle`, `usa:select`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/sidebar.ts](../../src/components/widgets/sidebar.ts)

## Minimal example

```html
<mo-sidebar label="Main"><a href="#" data-icon="⌂" aria-current="page">Home</a><a href="#" data-icon="✉">Inbox</a><a href="#" data-icon="⚙">Settings</a></mo-sidebar>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSidebar } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSidebar(); // registers <mo-sidebar>

/* then use it in your HTML:
<mo-sidebar label="Main"><a href="#" data-icon="⌂" aria-current="page">Home</a><a href="#" data-icon="✉">Inbox</a><a href="#" data-icon="⚙">Settings</a></mo-sidebar>
*/
```
