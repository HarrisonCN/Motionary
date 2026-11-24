# `<mo-fan-carousel>` — Fan carousel

> Element name `<mo-fan-carousel>` (default since 17.3); the legacy name `<usa-fan-carousel>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Cards spread like a hand of cards; the front one is centred and the rest fan out behind it.

- **Category:** cards · **since** 17.10
- **Import:** `import { defineFanCarousel } from 'motionary/components/widgets'` then `defineFanCarousel();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `index`, `spread`, `loop`, `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`, `previous()`, `go()`
- **Source:** [src/components/widgets/fan-carousel.ts](../../src/components/widgets/fan-carousel.ts)

## Minimal example

```html
<mo-fan-carousel label="Cards"><div>One</div><div>Two</div><div>Three</div><div>Four</div></mo-fan-carousel>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFanCarousel } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFanCarousel(); // registers <mo-fan-carousel>

/* then use it in your HTML:
<mo-fan-carousel label="Cards"><div>One</div><div>Two</div><div>Three</div><div>Four</div></mo-fan-carousel>
*/
```
