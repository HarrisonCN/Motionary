# `<mo-spring-code>` — Spring code

> Element name `<mo-spring-code>` (default since 17.3); the legacy name `<usa-spring-code>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

One-time-code boxes: characters pop in, focus hops along, paste fills in a ripple; reject() shakes the row, accept() nods.

- **Category:** ui · **since** 17.17
- **Import:** `import { defineSpringCode } from 'motionary/components/widgets'` then `defineSpringCode();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `length`, `mode`, `group`, `label`, `value`, `name`, `mask`, `disabled`, `feel`, `haptics`
- **Events:** `usa:change`, `usa:complete`
- **Slots:** —
- **Methods:** `accept()`, `reject()`, `clear()`
- **Source:** [src/components/widgets/spring-code.ts](../../src/components/widgets/spring-code.ts)

## Minimal example

```html
<mo-spring-code length="6" group="3"></mo-spring-code>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringCode } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringCode(); // registers <mo-spring-code>

/* then use it in your HTML:
<mo-spring-code length="6" group="3"></mo-spring-code>
*/
```
