# `<mo-stack-slider>` — Stack slider

> Element name `<mo-stack-slider>` (default since 17.3); the legacy name `<usa-stack-slider>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Cards stacked with the next ones peeking out; swipe or press next to send the front one away.

- **Category:** cards · **since** 17.11
- **Import:** `import { defineStackSlider } from 'motionary/components/widgets'` then `defineStackSlider();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `index`, `visible`, `loop`, `label`, `prev-label`, `next-label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`, `prev()`
- **Source:** [src/components/widgets/stack-slider.ts](../../src/components/widgets/stack-slider.ts)

## Minimal example

```html
<mo-stack-slider label="Cards"><div>One</div><div>Two</div><div>Three</div></mo-stack-slider>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineStackSlider } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineStackSlider(); // registers <mo-stack-slider>

/* then use it in your HTML:
<mo-stack-slider label="Cards"><div>One</div><div>Two</div><div>Three</div></mo-stack-slider>
*/
```
