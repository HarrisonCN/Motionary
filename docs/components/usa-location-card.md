# `<mo-location-card>` — Location card

> Element name `<mo-location-card>` (default since 17.3); the legacy name `<usa-location-card>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.6: a place card with a stylised mini map — the route from the origin draws itself, the pin drops in with a bounce and a ring pulses; distance computed with haversine (km or mi).

- **Category:** ui · **since** 7.6
- **Import:** `import { defineLocationCard } from 'motionary/components/widgets'` then `defineLocationCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `name`, `address`, `lat`, `lon`, `from-lat`, `from-lon`, `distance`, `href`, `unit`
- **Events:** `usa:arrive`
- **Slots:** —
- **Methods:** `replay()`
- **Source:** [src/components/widgets/location-card.ts](../../src/components/widgets/location-card.ts)

## Minimal example

```html
<usa-location-card name="Blue Bottle" address="66 Mint St, San Francisco"
  lat="37.782" lon="-122.407" from-lat="37.776" from-lon="-122.394" href="https://maps.example/…"></usa-location-card>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineLocationCard } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLocationCard(); // registers <mo-location-card>

/* then use it in your HTML:
<mo-location-card name="Blue Bottle" address="66 Mint St, San Francisco"
  lat="37.782" lon="-122.407" from-lat="37.776" from-lon="-122.394" href="https://maps.example/…"></mo-location-card>
*/
```
