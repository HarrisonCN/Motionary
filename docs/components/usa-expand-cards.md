# `<mo-expand-cards>` — Expanding cards

> Element name `<mo-expand-cards>` (default since 17.3); the legacy name `<usa-expand-cards>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A row of panels where the chosen one widens and shows its text; stacks on narrow screens.

- **Category:** cards · **since** 17.10
- **Import:** `import { defineExpandCards } from 'motionary/components/widgets'` then `defineExpandCards();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `index`, `trigger`, `stack`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/expand-cards.ts](../../src/components/widgets/expand-cards.ts)

## Minimal example

```html
<mo-expand-cards><div data-title="Coast" data-image="assets/demo-photo.jpg">Morning tide.</div><div data-title="Forest" data-image="assets/demo-photo.jpg">Pines.</div><div data-title="City" data-image="assets/demo-photo.jpg">Night lights.</div></mo-expand-cards>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineExpandCards } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineExpandCards(); // registers <mo-expand-cards>

/* then use it in your HTML:
<mo-expand-cards><div data-title="Coast" data-image="assets/demo-photo.jpg">Morning tide.</div><div data-title="Forest" data-image="assets/demo-photo.jpg">Pines.</div><div data-title="City" data-image="assets/demo-photo.jpg">Night lights.</div></mo-expand-cards>
*/
```
