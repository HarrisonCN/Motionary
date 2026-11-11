# `<mo-route-sparkline>` — Route sparkline

> Element name `<mo-route-sparkline>` (default since 17.3); the legacy name `<usa-route-sparkline>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A supplied route or metric curve with an action button.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineRouteSparkline } from 'motionary/components/widgets'` then `defineRouteSparkline();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `values`, `title`, `status`, `unit`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/route-sparkline.ts](../../src/components/widgets/route-sparkline.ts)

## Minimal example

```html
<mo-route-sparkline value="6.5"></mo-route-sparkline>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRouteSparkline } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRouteSparkline(); // registers <mo-route-sparkline>

/* then use it in your HTML:
<mo-route-sparkline value="6.5"></mo-route-sparkline>
*/
```
