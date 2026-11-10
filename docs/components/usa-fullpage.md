# `<mo-fullpage>` — Full-page sections

> Element name `<mo-fullpage>` (default since 17.3); the legacy name `<usa-fullpage>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Full-screen sections that snap one at a time, with keyboard paging, dot navigation and a usa:section event.

- **Category:** page · **since** 2.7
- **Import:** `import { defineFullpage } from 'motionary/components/page'` then `defineFullpage();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `dots`, `axis`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineFullpage } from 'motionary/components/page';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFullpage(); // registers <mo-fullpage>

/* then use it in your HTML:
<mo-fullpage dots>
  <section>One</section>
  <section>Two</section>
</mo-fullpage>
*/
```
