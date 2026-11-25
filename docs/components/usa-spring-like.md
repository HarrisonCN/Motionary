# `<mo-spring-like>` — Spring like

> Element name `<mo-spring-like>` (default since 17.3); the legacy name `<usa-spring-like>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A like toggle whose heart squashes, pops past full size with a ring and a burst of dots, while the count rolls to its new number.

- **Category:** ui · **since** 17.17
- **Import:** `import { defineSpringLike } from 'motionary/components/widgets'` then `defineSpringLike();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `liked`, `count`, `compact`, `label`, `dots`, `fx`, `disabled`, `feel`, `haptics`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/spring-like.ts](../../src/components/widgets/spring-like.ts)

## Minimal example

```html
<mo-spring-like count="128"></mo-spring-like>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringLike } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringLike(); // registers <mo-spring-like>

/* then use it in your HTML:
<mo-spring-like count="128"></mo-spring-like>
*/
```
