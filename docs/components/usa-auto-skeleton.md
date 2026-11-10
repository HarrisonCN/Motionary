# `<mo-auto-skeleton>` — Auto skeleton

> Element name `<mo-auto-skeleton>` (default since 17.3); the legacy name `<usa-auto-skeleton>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Set loading and every heading, paragraph, image and button inside becomes a shimmering placeholder of its own size — no extra markup.

- **Category:** page · **since** 2.7
- **Import:** `import { defineAutoSkeleton } from 'motionary/components/page'` then `defineAutoSkeleton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `loading`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/page/auto-skeleton.ts](../../src/components/page/auto-skeleton.ts)

## Minimal example

```html
<usa-auto-skeleton loading>
  <h3>{{ title }}</h3>
  <p>{{ body }}</p>
</usa-auto-skeleton>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineAutoSkeleton } from 'motionary/components/page';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineAutoSkeleton(); // registers <mo-auto-skeleton>

/* then use it in your HTML:
<mo-auto-skeleton loading>
  <h3>{{ title }}</h3>
  <p>{{ body }}</p>
</mo-auto-skeleton>
*/
```
