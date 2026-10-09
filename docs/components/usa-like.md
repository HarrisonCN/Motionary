# `<usa-like>` — Like button

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A heart that pops with a spring and bursts into particles; aria-pressed, optional count.

- **Category:** click
- **Import:** `import { defineLike } from 'motionary/components/click'` then `defineLike();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** `liked`, `count`, `label`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/click/like.ts](../../src/components/click/like.ts)

## Minimal example

```html
<usa-like count="128"></usa-like>
```

## ES module

```js
import { defineLike } from 'motionary/components/click';

defineLike(); // registers <usa-like>

/* then use it in your HTML:
<usa-like count="128"></usa-like>
*/
```
