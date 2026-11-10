# `<mo-slider>` — Slider

> Element name `<mo-slider>` (default since 17.3); the legacy name `<usa-slider>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A form-associated range slider: spring-following thumb, value bubble, full keyboard support (arrows, Page Up/Down, Home/End).

- **Category:** ui · **since** 2.6
- **Import:** `import { defineSlider } from 'motionary/components/ui'` then `defineSlider();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `min`, `max`, `disabled`, `label`, `step`, `value`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/ui/slider.ts](../../src/components/ui/slider.ts)

## Minimal example

```html
<usa-slider name="volume" value="40" bubble label="Volume"></usa-slider>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSlider } from 'motionary/components/ui';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSlider(); // registers <mo-slider>

/* then use it in your HTML:
<mo-slider name="volume" value="40" bubble label="Volume"></mo-slider>
*/
```
