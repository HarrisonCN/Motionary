# `<usa-view-switch>` — View switch

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

One view at a time with direction-aware slide, fade, scale or drill transitions — tabs, wizards, app pages.

- **Category:** transitions · **since** 2.2
- **Import:** `import { defineViewSwitch } from 'motionary/components/transitions'` then `defineViewSwitch();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `active`, `duration`, `effect`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `show()`
- **Source:** [src/components/transitions/view-switch.ts](../../src/components/transitions/view-switch.ts)

## Minimal example

```html
<usa-view-switch active="home">
  <section data-view="home">…</section>
  <section data-view="about">…</section>
</usa-view-switch>
```

## ES module

```js
import { defineViewSwitch } from 'motionary/components/transitions';

defineViewSwitch(); // registers <usa-view-switch>

/* then use it in your HTML:
<usa-view-switch active="home">
  <section data-view="home">…</section>
  <section data-view="about">…</section>
</usa-view-switch>
*/
```
