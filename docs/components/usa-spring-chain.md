# `<mo-spring-chain>` — Spring chain

> Element name `<mo-spring-chain>` (default since 17.3); the legacy name `<usa-spring-chain>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A chain of links on damped springs that chases the pointer, each link chasing the one before, so the tail swings and settles like a rope. A press plucks it.

- **Category:** ui · **since** 17.19
- **Import:** `import { defineSpringChain } from 'motionary/components/widgets'` then `defineSpringChain();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `links`, `size`, `label`, `feel`
- **Events:** —
- **Slots:** —
- **Methods:** `pluck()`
- **Source:** [src/components/widgets/spring-chain.ts](../../src/components/widgets/spring-chain.ts)

## Minimal example

```html
<mo-spring-chain links="14" style="--usa-chain-height:180px"></mo-spring-chain>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringChain } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringChain(); // registers <mo-spring-chain>

/* then use it in your HTML:
<mo-spring-chain links="14" style="--usa-chain-height:180px"></mo-spring-chain>
*/
```
