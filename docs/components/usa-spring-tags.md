# `<mo-spring-tags>` — Spring tags

> Element name `<mo-spring-tags>` (default since 17.3); the legacy name `<usa-spring-tags>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Tags pop in and shrink away; a duplicate makes the chip that already has it shake. Enter, comma or paste adds tags.

- **Category:** ui · **since** 17.17
- **Import:** `import { defineSpringTags } from 'motionary/components/widgets'` then `defineSpringTags();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `label`, `placeholder`, `max`, `max-length`, `name`, `disabled`, `feel`, `haptics`
- **Events:** `usa:reject`, `usa:change`
- **Slots:** —
- **Methods:** `addTag()`, `removeTag()`
- **Source:** [src/components/widgets/spring-tags.ts](../../src/components/widgets/spring-tags.ts)

## Minimal example

```html
<mo-spring-tags value="design,motion"></mo-spring-tags>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringTags } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringTags(); // registers <mo-spring-tags>

/* then use it in your HTML:
<mo-spring-tags value="design,motion"></mo-spring-tags>
*/
```
