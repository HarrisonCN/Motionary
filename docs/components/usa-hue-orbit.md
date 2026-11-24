# `<mo-hue-orbit>` — <usa-hue-orbit>

> Element name `<mo-hue-orbit>` (default since 17.3); the legacy name `<usa-hue-orbit>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A hue picker drawn as an orbit: swatches sit on a ring, the picked one swells and the ring turns it to the top (always the short way round) while the core fills with its colour. Native radio inputs carry the choice, so arrow keys, Tab and screen readers work as usual.

- **Category:** widgets
- **Import:** `import { defineHueOrbit } from 'motionary/components/widgets'` then `defineHueOrbit();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `hue`, `count`, `saturation`, `lightness`, `label`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/hue-orbit.ts](../../src/components/widgets/hue-orbit.ts)

## Minimal example

```html
<usa-hue-orbit></usa-hue-orbit>
```
