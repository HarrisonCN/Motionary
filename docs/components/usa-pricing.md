# `<mo-pricing>` — Pricing table

> Element name `<mo-pricing>` (default since 17.3); the legacy name `<usa-pricing>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Monthly / yearly switch with a sliding thumb; prices roll to the new figure and the featured plan lifts.

- **Category:** ui · **since** 17.10
- **Import:** `import { definePricing } from 'motionary/components/widgets'` then `definePricing();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `period`, `currency`, `label`, `monthly-label`, `yearly-label`, `yearly-note`, `locale`, `month-unit`, `year-unit`
- **Events:** `usa:change`, `usa:select`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/pricing.ts](../../src/components/widgets/pricing.ts)

## Minimal example

```html
<mo-pricing currency="$"><div data-name="Starter" data-monthly="0" data-yearly="0">For trying it out</div><div data-name="Pro" data-monthly="12" data-yearly="120" data-featured data-badge="Popular">For teams</div></mo-pricing>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePricing } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePricing(); // registers <mo-pricing>

/* then use it in your HTML:
<mo-pricing currency="$"><div data-name="Starter" data-monthly="0" data-yearly="0">For trying it out</div><div data-name="Pro" data-monthly="12" data-yearly="120" data-featured data-badge="Popular">For teams</div></mo-pricing>
*/
```
