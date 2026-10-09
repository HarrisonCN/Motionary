# `<usa-overscroll>` — Elastic overscroll

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A scroll container whose edges stretch with iOS-style rubber-band resistance and spring back — touch, trackpad and wheel.

- **Category:** physics
- **Import:** `import { defineOverscroll } from 'motionary/components/physics'` then `defineOverscroll();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** `axis`, `disabled`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/physics/overscroll.ts](../../src/components/physics/overscroll.ts)

## Minimal example

```html
<usa-overscroll style="height: 240px">
  <ul>…</ul>
</usa-overscroll>
```

## ES module

```js
import { defineOverscroll } from 'motionary/components/physics';

defineOverscroll(); // registers <usa-overscroll>

/* then use it in your HTML:
<usa-overscroll style="height: 240px">
  <ul>…</ul>
</usa-overscroll>
*/
```
