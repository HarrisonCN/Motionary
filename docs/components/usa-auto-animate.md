# `<mo-auto-animate>` — Auto-animate

> Element name `<mo-auto-animate>` (default since 17.3); the legacy name `<usa-auto-animate>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Wrap a list or grid: items that are added fade in, removed ones fade out in place, and everything else glides to its new spot — on sort, filter or resize. Zero code at the call site.

- **Category:** layout · **since** 3.6 · **changed in** 3.9, 4.0
- **Import:** `import { defineAutoAnimate } from 'motionary/components/layout'` then `defineAutoAnimate();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `duration`, `no-scale`
- **Events:** —
- **Slots:** —
- **Methods:** `enable()`, `disable()`
- **Source:** [src/components/layout/elements.ts](../../src/components/layout/elements.ts)

## Minimal example

```html
<usa-auto-animate>
  <ul class="todo"><li>Write the brief</li><li>Review</li></ul>
</usa-auto-animate>

<!-- or on any element: -->
<ul class="grid"><li>A</li><li>B</li></ul>
<script type="module">
  import { autoAnimate } from 'motionary/components/layout';
  autoAnimate(document.querySelector('.grid'));
</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineAutoAnimate } from 'motionary/components/layout';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineAutoAnimate(); // registers <mo-auto-animate>

/* then use it in your HTML:
<mo-auto-animate>
  <ul class="todo"><li>Write the brief</li><li>Review</li></ul>
</mo-auto-animate>

<!-- or on any element: -->
<ul class="grid"><li>A</li><li>B</li></ul>
*/
```
