# `<usa-gyro-card>` — Gyro 3D card

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.7: a 3D card that tilts with the phone’s gyroscope (and with the pointer on desktop), with a moving glare and layers that float at different depths.

- **Category:** ui · **since** 8.7
- **Import:** `import { defineGyroCard } from 'motionary/components/widgets'` then `defineGyroCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
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
import { defineGyroCard } from 'motionary/components/widgets';

defineGyroCard(); // registers <usa-gyro-card>

/* then use it in your HTML:
<usa-gyro-card max="15">
  <h3 data-depth="2">Gyro</h3>
  <p data-depth="1">Tilt your phone</p>
</usa-gyro-card>
*/
```
