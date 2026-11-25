# `<mo-spring-swipe>` — Spring swipe

> Element name `<mo-spring-swipe>` (default since 17.3); the legacy name `<usa-spring-swipe>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A row that swipes open to reveal actions, with rubber-band ends and a flick to open or shut; a ⋯ button does the same for the keyboard.

- **Category:** ui · **since** 17.17
- **Import:** `import { defineSpringSwipe } from 'motionary/components/widgets'` then `defineSpringSwipe();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `actions`, `open`, `label`, `disabled`, `feel`, `haptics`
- **Events:** `usa:toggle`, `usa:action`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/spring-swipe.ts](../../src/components/widgets/spring-swipe.ts)

## Minimal example

```html
<mo-spring-swipe actions="Archive|Delete:danger">Weekly report is ready</mo-spring-swipe>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringSwipe } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringSwipe(); // registers <mo-spring-swipe>

/* then use it in your HTML:
<mo-spring-swipe actions="Archive|Delete:danger">Weekly report is ready</mo-spring-swipe>
*/
```
