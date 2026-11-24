# `<mo-tour>` — Product tour

> Element name `<mo-tour>` (default since 17.3); the legacy name `<usa-tour>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A guided tour: the page dims around each target and a card with Back / Next / Skip walks through the steps; Escape ends it.

- **Category:** ui · **since** 17.13
- **Import:** `import { defineTour } from 'motionary/components/widgets'` then `defineTour();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `open`, `label`, `next-label`, `back-label`, `done-label`, `skip-label`, `count-label`, `padding`
- **Events:** `usa:step`, `usa:end`
- **Slots:** —
- **Methods:** `start()`, `next()`, `back()`, `end()`
- **Source:** [src/components/widgets/tour.ts](../../src/components/widgets/tour.ts)

## Minimal example

```html
<mo-tour><button data-start>Start tour</button><div data-step data-target="#tour-demo-a" data-title="Search">Find anything here.</div><div data-step data-target="#tour-demo-b" data-title="Save">Your work is kept here.</div></mo-tour><p><span id="tour-demo-a">🔍 Search</span> · <span id="tour-demo-b">💾 Save</span></p>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTour } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTour(); // registers <mo-tour>

/* then use it in your HTML:
<mo-tour><button data-start>Start tour</button><div data-step data-target="#tour-demo-a" data-title="Search">Find anything here.</div><div data-step data-target="#tour-demo-b" data-title="Save">Your work is kept here.</div></mo-tour><p><span id="tour-demo-a">🔍 Search</span> · <span id="tour-demo-b">💾 Save</span></p>
*/
```
