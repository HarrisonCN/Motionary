# `<usa-auto-animate>` — Auto-animate

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Wrap a list or grid: items that are added fade in, removed ones fade out in place, and everything else glides to its new spot — on sort, filter or resize. Zero code at the call site.

- **Category:** layout · **since** 3.6 · **changed in** 3.9, 4.0
- **Import:** `import { defineAutoAnimate } from 'motionary/components/layout'` then `defineAutoAnimate();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `duration`, `no-scale`
- **Events:** —
- **Slots:** —
- **Methods:** `enable()`, `disable()`
- **Source:** [src/components/layout/elements.ts](../../src/components/layout/elements.ts)

## Minimal example

```html
<usa-auto-animate>
  <ul class="todo">…</ul>
</usa-auto-animate>

<!-- or on any element: -->
<script type="module">
  import { autoAnimate } from 'motionary/components/layout';
  autoAnimate(document.querySelector('.grid'));
</script>
```

## ES module

```js
import { defineAutoAnimate } from 'motionary/components/layout';

defineAutoAnimate(); // registers <usa-auto-animate>

/* then use it in your HTML:
<usa-auto-animate>
  <ul class="todo">…</ul>
</usa-auto-animate>

<!-- or on any element: -->
*/
```
