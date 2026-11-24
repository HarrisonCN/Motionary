# `<mo-sticky-cta>` — Sticky call to action

> Element name `<mo-sticky-cta>` (default since 17.3); the legacy name `<usa-sticky-cta>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A call-to-action bar that slides in once the reader scrolls past a point or element, and away again near the top.

- **Category:** page · **since** 17.10
- **Import:** `import { defineStickyCta } from 'motionary/components/widgets'` then `defineStickyCta();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `watch`, `offset`, `position`, `label`, `dismissible`, `close-label`
- **Events:** `usa:dismiss`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/sticky-cta.ts](../../src/components/widgets/sticky-cta.ts)

## Minimal example

```html
<mo-sticky-cta offset="320" dismissible><span>Ready to start?</span><a href="#">Sign up</a></mo-sticky-cta>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineStickyCta } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineStickyCta(); // registers <mo-sticky-cta>

/* then use it in your HTML:
<mo-sticky-cta offset="320" dismissible><span>Ready to start?</span><a href="#">Sign up</a></mo-sticky-cta>
*/
```
