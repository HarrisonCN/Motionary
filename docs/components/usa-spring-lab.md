# `<mo-spring-lab>` — Spring laboratory

> Element name `<mo-spring-lab>` (default since 17.3); the legacy name `<usa-spring-lab>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Tune mass, damping and stiffness; inspect the real step response and replay it.

- **Category:** timeline · **since** 17.6
- **Import:** `import { defineSpringLab } from 'motionary/components/widgets'` then `defineSpringLab();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `disabled`, `stiffness`, `damping`, `mass`
- **Events:** `usa:action`, `usa:change`
- **Slots:** —
- **Methods:** `update()`, `reset()`, `play()`, `pause()`
- **Source:** [src/components/widgets/spring-lab.ts](../../src/components/widgets/spring-lab.ts)

## Minimal example

```html
<mo-spring-lab></mo-spring-lab>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringLab } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringLab(); // registers <mo-spring-lab>

/* then use it in your HTML:
<mo-spring-lab></mo-spring-lab>
*/
```
