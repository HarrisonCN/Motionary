# `<mo-toast-stack>` — Toast stack

> Element name `<mo-toast-stack>` (default since 17.3); the legacy name `<usa-toast-stack>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.3: toasts pile up into a collapsed stack (newest in front, older ones peeking behind), fan out on hover or focus, auto-dismiss (paused while hovered) and swipe away. Six positions, a polite live region, stackToast() helper and data-usa-toast triggers.

- **Category:** feedback · **since** 6.3 · **changed in** 13.3
- **Import:** `import { defineToastStack } from 'motionary/components/widgets'` then `defineToastStack();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `position`, `duration`, `max`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineToastStack } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineToastStack(); // registers <mo-toast-stack>

/* then use it in your HTML:
<button data-usa-toast="Saved to your library" data-usa-toast-type="success">Save</button>
<mo-toast-stack position="bottom-right" duration="4000" max="3"></mo-toast-stack>
<!-- or from JS: stackToast({ title: 'Done', message: 'Saved', type: 'success' }) -->
*/
```
