# `<mo-spring-rating>` — Spring rating

> Element name `<mo-spring-rating>` (default since 17.3); the legacy name `<usa-spring-rating>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Stars that lift on hover and pop up one after another when chosen; halves, read-only and full keyboard support.

- **Category:** ui · **since** 17.17
- **Import:** `import { defineSpringRating } from 'motionary/components/widgets'` then `defineSpringRating();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `max`, `half`, `label`, `readonly`, `clearable`, `show-value`, `size`, `disabled`, `feel`, `haptics`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/spring-rating.ts](../../src/components/widgets/spring-rating.ts)

## Minimal example

```html
<mo-spring-rating value="4" show-value></mo-spring-rating>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringRating } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringRating(); // registers <mo-spring-rating>

/* then use it in your HTML:
<mo-spring-rating value="4" show-value></mo-spring-rating>
*/
```
