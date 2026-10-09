# `<usa-fullpage>` — Full-page sections

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Full-screen sections that snap one at a time, with keyboard paging, dot navigation and a usa:section event.

- **Category:** page
- **Import:** `import { defineFullpage } from 'motionary/components/page'` then `defineFullpage();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** `usa:section`
- **Slots:** —
- **Methods:** `go()`, `next()`, `prev()`
- **Source:** [src/components/page/fullpage.ts](../../src/components/page/fullpage.ts)

## Minimal example

```html
<usa-fullpage dots>
  <section>One</section>
  <section>Two</section>
</usa-fullpage>
```

## ES module

```js
import { defineFullpage } from 'motionary/components/page';

defineFullpage(); // registers <usa-fullpage>

/* then use it in your HTML:
<usa-fullpage dots>
  <section>One</section>
  <section>Two</section>
</usa-fullpage>
*/
```
