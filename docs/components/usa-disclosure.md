# `<usa-disclosure>` — Accordion 2.0

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.2: native <details> that spring open and closed (height + fade) with an overshooting chevron; one open at a time unless multiple. Find-in-page and keyboard keep working.

- **Category:** transitions · **since** 6.2
- **Import:** `import { defineDisclosure } from 'motionary/components/widgets'` then `defineDisclosure();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `multiple`, `spring`
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** `toggle()`, `openAll()`, `closeAll()`
- **Source:** [src/components/widgets/disclosure.ts](../../src/components/widgets/disclosure.ts)

## Minimal example

```html
<usa-disclosure variant="cards">
  <details><summary>Shipping</summary><p>…</p></details>
  <details><summary>Returns</summary><p>…</p></details>
</usa-disclosure>
```

## ES module

```js
import { defineDisclosure } from 'motionary/components/widgets';

defineDisclosure(); // registers <usa-disclosure>

/* then use it in your HTML:
<usa-disclosure variant="cards">
  <details><summary>Shipping</summary><p>…</p></details>
  <details><summary>Returns</summary><p>…</p></details>
</usa-disclosure>
*/
```
