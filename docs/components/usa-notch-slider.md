# `<mo-notch-slider>` — <usa-notch-slider>

> Element name `<mo-notch-slider>` (default since 17.3); the legacy name `<usa-notch-slider>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A slider with detents: notch marks along the track, a thumb that follows on a spring, a tick that pops as the value passes each notch, and a gentle snap onto a notch when released close to it. A native range input carries the value, so it works with arrow / Page / Home / End keys and submits with a form.

- **Category:** widgets
- **Import:** `import { defineNotchSlider } from 'motionary/components/widgets'` then `defineNotchSlider();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `min`, `max`, `step`, `notches`, `snap`, `unit`, `name`, `label`, `disabled`
- **Events:** `usa:detent`, `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/notch-slider.ts](../../src/components/widgets/notch-slider.ts)

## Minimal example

```html
<usa-notch-slider></usa-notch-slider>
```
