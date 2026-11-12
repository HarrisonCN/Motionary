# `<mo-cta-popup>` — Deliberate popup

> Element name `<mo-cta-popup>` (default since 17.3); the legacy name `<usa-cta-popup>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A native modal dialog with focus return, Escape and cancelable confirmation.

- **Category:** ui · **since** 17.7
- **Import:** `import { defineCtaPopup } from 'motionary/components/widgets'` then `defineCtaPopup();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `title`, `message`, `action-label`, `open`, `disabled`
- **Events:** `usa:open`, `usa:close`, `usa:confirm`
- **Slots:** —
- **Methods:** `show()`, `hide()`, `changed()`, `mount()`
- **Source:** [src/components/widgets/cta-popup.ts](../../src/components/widgets/cta-popup.ts)

## Minimal example

```html
<mo-cta-popup label="Open invitation" title="A little space for your next idea." action-label="Count me in"></mo-cta-popup>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCtaPopup } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCtaPopup(); // registers <mo-cta-popup>

/* then use it in your HTML:
<mo-cta-popup label="Open invitation" title="A little space for your next idea." action-label="Count me in"></mo-cta-popup>
*/
```
