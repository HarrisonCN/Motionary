# `<mo-micro-slider>` — Micro slider

> Element name `<mo-micro-slider>` (default since 17.3); the legacy name `<usa-micro-slider>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

The thumb settles onto the nearest step, squashes with its speed and shows a value bubble; dragging past an end stretches the track like rubber.

- **Category:** ui · **since** 17.16
- **Import:** `import { defineMicroSlider } from 'motionary/components/widgets'` then `defineMicroSlider();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `min`, `max`, `step`, `value`, `label`, `unit`, `name`, `disabled`, `feel`, `haptics`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/micro-slider.ts](../../src/components/widgets/micro-slider.ts)

## Minimal example

```html
<mo-micro-slider label="Volume" value="40" step="5" unit="%"></mo-micro-slider>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMicroSlider } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMicroSlider(); // registers <mo-micro-slider>

/* then use it in your HTML:
<mo-micro-slider label="Volume" value="40" step="5" unit="%"></mo-micro-slider>
*/
```
