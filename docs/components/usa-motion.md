# `<usa-motion>` — Motion DSL

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.0: the declarative motion DSL — describe motion as one readable string (“enter: fade-up 600ms stagger 80ms; hover: pop”) on <usa-motion> or any element’s data-motion, no JavaScript per element.

- **Category:** ui · **since** 9.0
- **Import:** `import { defineMotion } from 'motionary/components/widgets'` then `defineMotion();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `rules`
- **Events:** `usa:motion-error`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/motion.ts](../../src/components/widgets/motion.ts)

## Minimal example

```html
<usa-motion rules="enter: fade-up 600ms ease-out stagger 80ms; hover: pop">
  <div class="card">One</div><div class="card">Two</div><div class="card">Three</div>
</usa-motion>

<!-- or on any element, with applyMotion() from motionary/dsl -->
<section data-motion="enter: fade-up 500ms; click: confetti count=40">…</section>
```

## ES module

```js
import { defineMotion } from 'motionary/components/widgets';

defineMotion(); // registers <usa-motion>

/* then use it in your HTML:
<usa-motion rules="enter: fade-up 600ms ease-out stagger 80ms; hover: pop">
  <div class="card">One</div><div class="card">Two</div><div class="card">Three</div>
</usa-motion>

<!-- or on any element, with applyMotion() from motionary/dsl -->
<section data-motion="enter: fade-up 500ms; click: confetti count=40">…</section>
*/
```
