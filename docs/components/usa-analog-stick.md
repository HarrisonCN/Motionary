# `<mo-analog-stick>` — <usa-analog-stick>

> Element name `<mo-analog-stick>` (default since 17.3); the legacy name `<usa-analog-stick>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Apply a radial dead zone and rescale the rest so the reading still reaches 1 at the rim.

- **Category:** widgets
- **Import:** `import { defineAnalogStick } from 'motionary/components/widgets'` then `defineAnalogStick();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `dead-zone`, `disabled`
- **Events:** `usa:move`, `usa:release`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/analog-stick.ts](../../src/components/widgets/analog-stick.ts)

## Minimal example

```html
<usa-analog-stick></usa-analog-stick>
```
