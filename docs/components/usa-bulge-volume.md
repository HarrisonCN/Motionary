# `<mo-bulge-volume>` — <usa-bulge-volume>

> Element name `<mo-bulge-volume>` (default since 17.3); the legacy name `<usa-bulge-volume>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A vertical volume pill that bulges under the finger: press or drag anywhere on it to set the level, the pill swells around the touch point and settles on a spring when released. A native range input (visually tucked away, still focusable) carries the value for arrow / Page / Home / End keys and screen readers.

- **Category:** widgets
- **Import:** `import { defineBulgeVolume } from 'motionary/components/widgets'` then `defineBulgeVolume();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `label`, `disabled`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/bulge-volume.ts](../../src/components/widgets/bulge-volume.ts)

## Minimal example

```html
<usa-bulge-volume></usa-bulge-volume>
```
