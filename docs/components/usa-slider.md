# `<usa-slider>` — Slider

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A form-associated range slider: spring-following thumb, value bubble, full keyboard support (arrows, Page Up/Down, Home/End).

- **Category:** ui · **since** 2.6
- **Import:** `import { defineSlider } from 'motionary/components/ui'` then `defineSlider();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
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
import { defineSlider } from 'motionary/components/ui';

defineSlider(); // registers <usa-slider>

/* then use it in your HTML:
<usa-slider name="volume" value="40" bubble label="Volume"></usa-slider>
*/
```
