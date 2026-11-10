# `<mo-overscroll>` — Elastic overscroll

> Element name `<mo-overscroll>` (default since 17.3); the legacy name `<usa-overscroll>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A scroll container whose edges stretch with iOS-style rubber-band resistance and spring back — touch, trackpad and wheel.

- **Category:** physics · **since** 2.3
- **Import:** `import { defineOverscroll } from 'motionary/components/physics'` then `defineOverscroll();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `axis`, `disabled`, `max`, `preset`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineOverscroll } from 'motionary/components/physics';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineOverscroll(); // registers <mo-overscroll>

/* then use it in your HTML:
<mo-overscroll style="height: 240px">
  <ul>…</ul>
</mo-overscroll>
*/
```
