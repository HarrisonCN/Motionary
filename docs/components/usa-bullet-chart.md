# `<mo-bullet-chart>` — Bullet chart

> Element name `<mo-bullet-chart>` (default since 17.3); the legacy name `<usa-bullet-chart>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Each measure as a bar against a target line over poor / fair / good bands; met targets get a check.

- **Category:** layout · **since** 17.15
- **Import:** `import { defineBulletChart } from 'motionary/components/widgets'` then `defineBulletChart();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `values`, `targets`, `labels`, `ranges`, `max`, `colors`, `unit`, `label`, `target-label`, `met-label`, `missed-label`
- **Events:** `usa:select`
- **Slots:** —
- **Methods:** `mount()`, `defineMoName()`
- **Source:** [src/components/widgets/bullet-chart.ts](../../src/components/widgets/bullet-chart.ts)

## Minimal example

```html
<mo-bullet-chart values="82,54,96" targets="75,70,90" labels="Revenue,Profit,Satisfaction" max="100"></mo-bullet-chart>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBulletChart } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBulletChart(); // registers <mo-bullet-chart>

/* then use it in your HTML:
<mo-bullet-chart values="82,54,96" targets="75,70,90" labels="Revenue,Profit,Satisfaction" max="100"></mo-bullet-chart>
*/
```
