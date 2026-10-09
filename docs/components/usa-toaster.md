# `<usa-toaster>` — Toasts

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

toast("Saved") slides a notification in; it pauses on hover, stacks with FLIP and announces politely (errors assertively).

- **Category:** feedback
- **Import:** `import { defineToaster } from 'motionary/components/feedback'` then `defineToaster();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** `label`
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
import { defineToaster } from 'motionary/components/feedback';

defineToaster(); // registers <usa-toaster>

/* then use it in your HTML:
<usa-toaster position="bottom-right"></usa-toaster>
*/
```
