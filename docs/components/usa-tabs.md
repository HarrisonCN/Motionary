# `<usa-tabs>` — Tabs

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Accessible tabs whose indicator slides between tabs with a spring; panels slide in from the direction you moved. Line or pill indicator.

- **Category:** ui
- **Import:** `import { defineTabs } from 'motionary/components/ui'` then `defineTabs();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** `indicator`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `select()`
- **Source:** [src/components/ui/tabs.ts](../../src/components/ui/tabs.ts)

## Minimal example

```html
<usa-tabs>
  <nav><button data-tab>One</button><button data-tab>Two</button></nav>
  <section data-panel>…</section>
  <section data-panel>…</section>
</usa-tabs>
```

## ES module

```js
import { defineTabs } from 'motionary/components/ui';

defineTabs(); // registers <usa-tabs>

/* then use it in your HTML:
<usa-tabs>
  <nav><button data-tab>One</button><button data-tab>Two</button></nav>
  <section data-panel>…</section>
  <section data-panel>…</section>
</usa-tabs>
*/
```
