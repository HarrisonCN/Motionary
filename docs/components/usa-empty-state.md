# `<mo-empty-state>` — Empty state

> Element name `<mo-empty-state>` (default since 17.3); the legacy name `<usa-empty-state>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An illustration that draws itself, then the heading, text and actions rise in turn.

- **Category:** svg · **since** 17.10
- **Import:** `import { defineEmptyState } from 'motionary/components/widgets'` then `defineEmptyState();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `icon`, `heading`, `description`, `heading-level`, `compact`
- **Events:** —
- **Slots:** —
- **Methods:** `replay()`
- **Source:** [src/components/widgets/empty-state.ts](../../src/components/widgets/empty-state.ts)

## Minimal example

```html
<mo-empty-state icon="inbox" heading="No messages" description="New mail will show up here."><button type="button">Refresh</button></mo-empty-state>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineEmptyState } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineEmptyState(); // registers <mo-empty-state>

/* then use it in your HTML:
<mo-empty-state icon="inbox" heading="No messages" description="New mail will show up here."><button type="button">Refresh</button></mo-empty-state>
*/
```
