# `<usa-toast-stack>` — Toast stack

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.3: toasts pile up into a collapsed stack (newest in front, older ones peeking behind), fan out on hover or focus, auto-dismiss (paused while hovered) and swipe away. Six positions, a polite live region, stackToast() helper and data-usa-toast triggers.

- **Category:** feedback · **since** 6.3
- **Import:** `import { defineToastStack } from 'motionary/components/widgets'` then `defineToastStack();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `position`
- **Events:** `usa:show`, `usa:dismiss`
- **Slots:** —
- **Methods:** `show()`, `dismiss()`, `clear()`
- **Source:** [src/components/widgets/toast.ts](../../src/components/widgets/toast.ts)

## Minimal example

```html
<button data-usa-toast="Saved to your library" data-usa-toast-type="success">Save</button>
<usa-toast-stack position="bottom-right" duration="4000" max="3"></usa-toast-stack>
<!-- or from JS: stackToast({ title: 'Done', message: 'Saved', type: 'success' }) -->
```

## ES module

```js
import { defineToastStack } from 'motionary/components/widgets';

defineToastStack(); // registers <usa-toast-stack>

/* then use it in your HTML:
<button data-usa-toast="Saved to your library" data-usa-toast-type="success">Save</button>
<usa-toast-stack position="bottom-right" duration="4000" max="3"></usa-toast-stack>
<!-- or from JS: stackToast({ title: 'Done', message: 'Saved', type: 'success' }) -->
*/
```
