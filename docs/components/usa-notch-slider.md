# `<mo-notch-slider>` — Notch slider

> Element name `<mo-notch-slider>` (default since 17.3); the legacy name `<usa-notch-slider>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A native range with detents: crossing a notch pops it, letting go near one snaps to it.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineNotchSlider } from 'motionary/components/widgets'` then `defineNotchSlider();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `min`, `max`, `step`, `notches`, `snap`, `unit`, `name`, `label`, `disabled`
- **Events:** `usa:detent`, `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/notch-slider.ts](../../src/components/widgets/notch-slider.ts)

## Minimal example

```html
<mo-notch-slider label="Exposure" min="-2" max="2" step="0.1" notches="5" value="0" unit=" EV"></mo-notch-slider>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineNotchSlider } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineNotchSlider(); // registers <mo-notch-slider>

/* then use it in your HTML:
<mo-notch-slider label="Exposure" min="-2" max="2" step="0.1" notches="5" value="0" unit=" EV"></mo-notch-slider>
*/
```
