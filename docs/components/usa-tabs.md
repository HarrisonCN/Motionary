# `<mo-tabs>` — Tabs

> Element name `<mo-tabs>` (default since 17.3); the legacy name `<usa-tabs>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Accessible tabs whose indicator slides between tabs with a spring; panels slide in from the direction you moved. Line or pill indicator.

- **Category:** ui · **since** 2.6 · **changed in** 6.7
- **Import:** `import { defineTabs } from 'motionary/components/ui'` then `defineTabs();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineTabs } from 'motionary/components/ui';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTabs(); // registers <mo-tabs>

/* then use it in your HTML:
<mo-tabs>
  <nav><button data-tab>One</button><button data-tab>Two</button></nav>
  <section data-panel>…</section>
  <section data-panel>…</section>
</mo-tabs>
*/
```
