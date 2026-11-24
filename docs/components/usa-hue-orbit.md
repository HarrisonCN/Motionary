# `<mo-hue-orbit>` — Hue orbit

> Element name `<mo-hue-orbit>` (default since 17.3); the legacy name `<usa-hue-orbit>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pick a hue from dots on a ring; the ring turns the short way to bring the pick to the top.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineHueOrbit } from 'motionary/components/widgets'` then `defineHueOrbit();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `hue`, `count`, `saturation`, `lightness`, `label`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/hue-orbit.ts](../../src/components/widgets/hue-orbit.ts)

## Minimal example

```html
<mo-hue-orbit label="Accent colour" hue="210"></mo-hue-orbit>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineHueOrbit } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHueOrbit(); // registers <mo-hue-orbit>

/* then use it in your HTML:
<mo-hue-orbit label="Accent colour" hue="210"></mo-hue-orbit>
*/
```
