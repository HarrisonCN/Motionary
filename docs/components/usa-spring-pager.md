# `<mo-spring-pager>` — Spring pager

> Element name `<mo-spring-pager>` (default since 17.3); the legacy name `<usa-spring-pager>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pages that slide on a damped spring: rubber-band ends, one page per flick, dots that stretch toward the page they head for.

- **Category:** ui · **since** 17.18
- **Import:** `import { defineSpringPager } from 'motionary/components/widgets'` then `defineSpringPager();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `index`, `label`, `feel`, `haptics`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `next()`, `prev()`
- **Source:** [src/components/widgets/spring-pager.ts](../../src/components/widgets/spring-pager.ts)

## Minimal example

```html
<mo-spring-pager label="Tips"><div style="padding:28px;background:#eef2ff;border-radius:14px">Drag me</div><div style="padding:28px;background:#ecfdf5;border-radius:14px">Flick to turn</div><div style="padding:28px;background:#fff7ed;border-radius:14px">Ends stretch</div></mo-spring-pager>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringPager } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringPager(); // registers <mo-spring-pager>

/* then use it in your HTML:
<mo-spring-pager label="Tips"><div style="padding:28px;background:#eef2ff;border-radius:14px">Drag me</div><div style="padding:28px;background:#ecfdf5;border-radius:14px">Flick to turn</div><div style="padding:28px;background:#fff7ed;border-radius:14px">Ends stretch</div></mo-spring-pager>
*/
```
