# `<mo-motion-spec>` — Motion spec sheet

> Element name `<mo-motion-spec>` (default since 17.3); the legacy name `<usa-motion-spec>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.7: a motion spec sheet for design hand-off — each rule of a motion string with its trigger, a duration bar on a shared timeline and the easing curve, a Play playhead and Copy CSS; pairs with the Figma plugin and Framer export of motionary/design.

- **Category:** ui · **since** 9.7
- **Import:** `import { defineMotionSpec } from 'motionary/components/widgets'` then `defineMotionSpec();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `rules`, `label`
- **Events:** `usa:copy`
- **Slots:** —
- **Methods:** `play()`
- **Source:** [src/components/widgets/motion-spec.ts](../../src/components/widgets/motion-spec.ts)

## Minimal example

```html
<usa-motion-spec label="Card entrance" rules="enter: fade-up 600ms ease-out stagger 80ms; hover: pop 300ms spring"></usa-motion-spec>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMotionSpec } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMotionSpec(); // registers <mo-motion-spec>

/* then use it in your HTML:
<mo-motion-spec label="Card entrance" rules="enter: fade-up 600ms ease-out stagger 80ms; hover: pop 300ms spring"></mo-motion-spec>
*/
```
