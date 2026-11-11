# `<mo-halo-slider>` — Halo range slider

> Element name `<mo-halo-slider>` (default since 17.3); the legacy name `<usa-halo-slider>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A native range with a luminous glass thumb. Touch, keyboard, min/max/step, form submission and reset.

- **Category:** ui · **since** 17.4
- **Import:** `import { defineHaloSlider } from 'motionary/components/widgets'` then `defineHaloSlider();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `min`, `max`, `step`, `disabled`, `label`, `name`, `theme`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** `changed()`, `mount()`, `luminousTheme()`, `defineMoName()`
- **Source:** [src/components/widgets/halo-slider.ts](../../src/components/widgets/halo-slider.ts)

## Minimal example

```html
<mo-halo-slider value="65" label="Brightness"></mo-halo-slider>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineHaloSlider } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHaloSlider(); // registers <mo-halo-slider>

/* then use it in your HTML:
<mo-halo-slider value="65" label="Brightness"></mo-halo-slider>
*/
```
