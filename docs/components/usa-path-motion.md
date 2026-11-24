# `<mo-path-motion>` — Path motion

> Element name `<mo-path-motion>` (default since 17.3); the legacy name `<usa-path-motion>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Things that ride an SVG path on scroll, in view, on hover or in a loop, turning with it and drawing the trail.

- **Category:** svg · **since** 17.10
- **Import:** `import { definePathMotion } from 'motionary/components/widgets'` then `definePathMotion();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `path`, `trigger`, `duration`, `rotate`, `trace`, `spacing`, `show-path`
- **Events:** `usa:done`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/path-motion.ts](../../src/components/widgets/path-motion.ts)

## Minimal example

```html
<mo-path-motion trigger="loop" rotate trace><span>✈</span></mo-path-motion>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePathMotion } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePathMotion(); // registers <mo-path-motion>

/* then use it in your HTML:
<mo-path-motion trigger="loop" rotate trace><span>✈</span></mo-path-motion>
*/
```
