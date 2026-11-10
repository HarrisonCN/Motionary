# `<mo-prize-wheel>` — Prize wheel

> Element name `<mo-prize-wheel>` (default since 17.3); the legacy name `<usa-prize-wheel>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.5: a lottery wheel — Spin whirls it and it eases out on the result (random or spin(index)), the pointer ticks and the wheel glows; usa:result reports the prize.

- **Category:** ui · **since** 7.5
- **Import:** `import { definePrizeWheel } from 'motionary/components/widgets'` then `definePrizeWheel();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `segments`, `label`, `turns`, `duration`
- **Events:** `usa:result`
- **Slots:** —
- **Methods:** `spin()`
- **Source:** [src/components/widgets/prize-wheel.ts](../../src/components/widgets/prize-wheel.ts)

## Minimal example

```html
<usa-prize-wheel segments="10% off,Free ship,Try again,🎁 Gift,5% off,Jackpot"></usa-prize-wheel>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePrizeWheel } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePrizeWheel(); // registers <mo-prize-wheel>

/* then use it in your HTML:
<mo-prize-wheel segments="10% off,Free ship,Try again,🎁 Gift,5% off,Jackpot"></mo-prize-wheel>
*/
```
