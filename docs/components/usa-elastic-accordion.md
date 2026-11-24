# `<mo-elastic-accordion>` — Elastic accordion

> Element name `<mo-elastic-accordion>` (default since 17.3); the legacy name `<usa-elastic-accordion>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A disclosure whose body opens on a spring, overshooting a little before it settles.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineElasticAccordion } from 'motionary/components/widgets'` then `defineElasticAccordion();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `heading`, `open`, `disabled`
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/elastic-accordion.ts](../../src/components/widgets/elastic-accordion.ts)

## Minimal example

```html
<mo-elastic-accordion heading="Shipping"><p>Free over $50.</p></mo-elastic-accordion>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineElasticAccordion } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineElasticAccordion(); // registers <mo-elastic-accordion>

/* then use it in your HTML:
<mo-elastic-accordion heading="Shipping"><p>Free over $50.</p></mo-elastic-accordion>
*/
```
