# `<mo-spring-counter>` — Spring counter

> Element name `<mo-spring-counter>` (default since 17.3); the legacy name `<usa-spring-counter>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Digits roll on springs to each new value, new columns grow in, and screen readers get the plain number.

- **Category:** ui · **since** 17.17
- **Import:** `import { defineSpringCounter } from 'motionary/components/widgets'` then `defineSpringCounter();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `decimals`, `group`, `prefix`, `suffix`, `from-zero`, `label`, `feel`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/spring-counter.ts](../../src/components/widgets/spring-counter.ts)

## Minimal example

```html
<mo-spring-counter value="1280" group="," from-zero></mo-spring-counter>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringCounter } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringCounter(); // registers <mo-spring-counter>

/* then use it in your HTML:
<mo-spring-counter value="1280" group="," from-zero></mo-spring-counter>
*/
```
