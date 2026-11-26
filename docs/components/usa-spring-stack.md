# `<mo-spring-stack>` — Spring stack

> Element name `<mo-spring-stack>` (default since 17.3); the legacy name `<usa-spring-stack>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A pile of cards that unrolls into a list in a soft cascade, each card on its own slightly later spring, and gathers back behind the first.

- **Category:** ui · **since** 17.18
- **Import:** `import { defineSpringStack } from 'motionary/components/widgets'` then `defineSpringStack();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `open`, `more`, `less`, `peek`, `gap`, `feel`, `haptics`
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/spring-stack.ts](../../src/components/widgets/spring-stack.ts)

## Minimal example

```html
<mo-spring-stack><div><strong>Build passed</strong><br><small>2 min ago</small></div><div><strong>New comment</strong><br><small>5 min ago</small></div><div><strong>Deploy queued</strong><br><small>8 min ago</small></div></mo-spring-stack>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringStack } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringStack(); // registers <mo-spring-stack>

/* then use it in your HTML:
<mo-spring-stack><div><strong>Build passed</strong><br><small>2 min ago</small></div><div><strong>New comment</strong><br><small>5 min ago</small></div><div><strong>Deploy queued</strong><br><small>8 min ago</small></div></mo-spring-stack>
*/
```
