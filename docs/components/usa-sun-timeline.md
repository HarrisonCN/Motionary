# `<mo-sun-timeline>` — Sun timeline

> Element name `<mo-sun-timeline>` (default since 17.3); the legacy name `<usa-sun-timeline>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Day, sunset and dusk capsules with independently supplied times.

- **Category:** ui · **since** 17.5
- **Import:** `import { defineSunTimeline } from 'motionary/components/widgets'` then `defineSunTimeline();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `value`, `disabled`, `animated`, `running`, `now-label`, `sunset-label`, `dusk-label`, `now`, `sunset`, `dusk`
- **Events:** `usa:action`, `usa:change`, `usa:tick`, `usa:complete`
- **Slots:** —
- **Methods:** `update()`, `play()`, `pause()`, `reset()`
- **Source:** [src/components/widgets/sun-timeline.ts](../../src/components/widgets/sun-timeline.ts)

## Minimal example

```html
<mo-sun-timeline ></mo-sun-timeline>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSunTimeline } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSunTimeline(); // registers <mo-sun-timeline>

/* then use it in your HTML:
<mo-sun-timeline ></mo-sun-timeline>
*/
```
