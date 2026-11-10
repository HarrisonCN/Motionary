# `<mo-toaster>` — Toasts

> Element name `<mo-toaster>` (default since 17.3); the legacy name `<usa-toaster>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

toast("Saved") slides a notification in; it pauses on hover, stacks with FLIP and announces politely (errors assertively).

- **Category:** feedback · **since** 2.2
- **Import:** `import { defineToaster } from 'motionary/components/feedback'` then `defineToaster();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `label`, `position`, `max`
- **Events:** `usa:toast`
- **Slots:** —
- **Methods:** `show()`, `clear()`
- **Source:** [src/components/feedback/toast.ts](../../src/components/feedback/toast.ts)

## Minimal example

```html
<usa-toaster position="bottom-right"></usa-toaster>
<script type="module">
  import { toast } from 'motionary/components/feedback';
  toast('Saved', { type: 'success' });
</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineToaster } from 'motionary/components/feedback';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineToaster(); // registers <mo-toaster>

/* then use it in your HTML:
<mo-toaster position="bottom-right"></mo-toaster>
*/
```
