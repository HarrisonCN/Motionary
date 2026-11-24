# `<mo-morph-card>` — Morphing card

> Element name `<mo-morph-card>` (default since 17.3); the legacy name `<usa-morph-card>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A card that grows into its detail dialog in one shared-element morph and shrinks back.

- **Category:** cards · **since** 17.11
- **Import:** `import { defineMorphCard } from 'motionary/components/widgets'` then `defineMorphCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `close-label`
- **Events:** `usa:open`, `usa:close`
- **Slots:** —
- **Methods:** `show()`, `close()`
- **Source:** [src/components/widgets/morph-card.ts](../../src/components/widgets/morph-card.ts)

## Minimal example

```html
<mo-morph-card><div>Open me</div><div data-detail hidden><h3>Details</h3><p>More text.</p></div></mo-morph-card>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMorphCard } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMorphCard(); // registers <mo-morph-card>

/* then use it in your HTML:
<mo-morph-card><div>Open me</div><div data-detail hidden><h3>Details</h3><p>More text.</p></div></mo-morph-card>
*/
```
