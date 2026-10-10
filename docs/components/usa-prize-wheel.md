# `<usa-prize-wheel>` — Prize wheel

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.5: a lottery wheel — Spin whirls it and it eases out on the result (random or spin(index)), the pointer ticks and the wheel glows; usa:result reports the prize.

- **Category:** ui · **since** 7.5
- **Import:** `import { definePrizeWheel } from 'motionary/components/widgets'` then `definePrizeWheel();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
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
import { definePrizeWheel } from 'motionary/components/widgets';

definePrizeWheel(); // registers <usa-prize-wheel>

/* then use it in your HTML:
<usa-prize-wheel segments="10% off,Free ship,Try again,🎁 Gift,5% off,Jackpot"></usa-prize-wheel>
*/
```
