# `<mo-weather-card>` — Animated weather card

> Element name `<mo-weather-card>` (default since 17.3); the legacy name `<usa-weather-card>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.8: sun rays turn, clouds drift, rain and snow fall, a flash-safe bolt glows, fog bands and stars — pick a condition and the scene cross-fades; the temperature counts up.

- **Category:** feedback · **since** 6.8
- **Import:** `import { defineWeatherCard } from 'motionary/components/widgets'` then `defineWeatherCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `condition`, `temp`, `place`, `unit`, `label`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/weather-card.ts](../../src/components/widgets/weather-card.ts)

## Minimal example

```html
<usa-weather-card condition="rain" temp="12" place="Lisbon"></usa-weather-card>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineWeatherCard } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineWeatherCard(); // registers <mo-weather-card>

/* then use it in your HTML:
<mo-weather-card condition="rain" temp="12" place="Lisbon"></mo-weather-card>
*/
```
