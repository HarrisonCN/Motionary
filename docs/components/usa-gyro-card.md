# `<mo-gyro-card>` — Gyro 3D card

> Element name `<mo-gyro-card>` (default since 17.3); the legacy name `<usa-gyro-card>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.7: a 3D card that tilts with the phone’s gyroscope (and with the pointer on desktop), with a moving glare and layers that float at different depths.

- **Category:** ui · **since** 8.7 · **changed in** 11.8
- **Import:** `import { defineGyroCard } from 'motionary/components/widgets'` then `defineGyroCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `max`, `glare`
- **Events:** `usa:tilt`
- **Slots:** —
- **Methods:** `tilt()`, `wobble()`
- **Source:** [src/components/widgets/gyro-card.ts](../../src/components/widgets/gyro-card.ts)

## Minimal example

```html
<usa-gyro-card max="15">
  <h3 data-depth="2">Gyro</h3>
  <p data-depth="1">Tilt your phone</p>
</usa-gyro-card>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineGyroCard } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineGyroCard(); // registers <mo-gyro-card>

/* then use it in your HTML:
<mo-gyro-card max="15">
  <h3 data-depth="2">Gyro</h3>
  <p data-depth="1">Tilt your phone</p>
</mo-gyro-card>
*/
```
