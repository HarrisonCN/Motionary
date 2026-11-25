# `<mo-spring-list>` — Spring list

> Element name `<mo-spring-list>` (default since 17.3); the legacy name `<usa-spring-list>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Drag the handles to reorder: the picked item lifts and tilts, the others spring out of the way; full keyboard reordering.

- **Category:** ui · **since** 17.17
- **Import:** `import { defineSpringList } from 'motionary/components/widgets'` then `defineSpringList();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `items`, `label`, `gap`, `disabled`, `feel`, `haptics`
- **Events:** `usa:reorder`
- **Slots:** —
- **Methods:** `move()`
- **Source:** [src/components/widgets/spring-list.ts](../../src/components/widgets/spring-list.ts)

## Minimal example

```html
<mo-spring-list items="Inbox|Today|Upcoming|Someday"></mo-spring-list>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringList } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringList(); // registers <mo-spring-list>

/* then use it in your HTML:
<mo-spring-list items="Inbox|Today|Upcoming|Someday"></mo-spring-list>
*/
```
