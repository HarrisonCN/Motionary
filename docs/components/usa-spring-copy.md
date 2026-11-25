# `<mo-spring-copy>` — Spring copy

> Element name `<mo-spring-copy>` (default since 17.3); the legacy name `<usa-spring-copy>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Copies text to the clipboard: the icon springs away and a tick pops in, or the button shakes with a cross when it cannot.

- **Category:** ui · **since** 17.17
- **Import:** `import { defineSpringCopy } from 'motionary/components/widgets'` then `defineSpringCopy();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `text`, `for`, `label`, `copied-label`, `failed-label`, `show-text`, `reset`, `fx`, `disabled`, `feel`, `haptics`
- **Events:** `usa:copy`
- **Slots:** —
- **Methods:** `copy()`
- **Source:** [src/components/widgets/spring-copy.ts](../../src/components/widgets/spring-copy.ts)

## Minimal example

```html
<mo-spring-copy text="npm i motionary" show-text></mo-spring-copy>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringCopy } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringCopy(); // registers <mo-spring-copy>

/* then use it in your HTML:
<mo-spring-copy text="npm i motionary" show-text></mo-spring-copy>
*/
```
