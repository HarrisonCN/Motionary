# `<mo-spring-toasts>` — Spring toasts

> Element name `<mo-spring-toasts>` (default since 17.3); the legacy name `<usa-spring-toasts>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Toasts drop in with an overshoot and pile up neatly; the pile fans out on hover or focus, and a toast can be swiped away.

- **Category:** ui · **since** 17.17
- **Import:** `import { defineSpringToasts } from 'motionary/components/widgets'` then `defineSpringToasts();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `position`, `duration`, `max`, `label`, `feel`, `haptics`
- **Events:** `usa:dismiss`, `usa:show`
- **Slots:** —
- **Methods:** `show()`, `dismiss()`, `clear()`
- **Source:** [src/components/widgets/spring-toasts.ts](../../src/components/widgets/spring-toasts.ts)

## Minimal example

```html
<mo-spring-toasts></mo-spring-toasts>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringToasts } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringToasts(); // registers <mo-spring-toasts>

/* then use it in your HTML:
<mo-spring-toasts></mo-spring-toasts>
*/
```
