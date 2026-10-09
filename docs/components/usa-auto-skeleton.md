# `<usa-auto-skeleton>` — Auto skeleton

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Set loading and every heading, paragraph, image and button inside becomes a shimmering placeholder of its own size — no extra markup.

- **Category:** page
- **Import:** `import { defineAutoSkeleton } from 'motionary/components/page'` then `defineAutoSkeleton();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
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
import { defineAutoSkeleton } from 'motionary/components/page';

defineAutoSkeleton(); // registers <usa-auto-skeleton>

/* then use it in your HTML:
<usa-auto-skeleton loading>
  <h3>{{ title }}</h3>
  <p>{{ body }}</p>
</usa-auto-skeleton>
*/
```
