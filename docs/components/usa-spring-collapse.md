# `<mo-spring-collapse>` — Spring collapse

> Element name `<mo-spring-collapse>` (default since 17.3); the legacy name `<usa-spring-collapse>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

One collapsible panel whose height opens on a damped spring with a short settle; the content drifts in and a second click reverses from where it is.

- **Category:** ui · **since** 17.18
- **Import:** `import { defineSpringCollapse } from 'motionary/components/widgets'` then `defineSpringCollapse();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `open`, `disabled`, `feel`, `haptics`
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/spring-collapse.ts](../../src/components/widgets/spring-collapse.ts)

## Minimal example

```html
<mo-spring-collapse label="What does damped mean?"><p>The motion overshoots a little, then settles instead of stopping dead.</p></mo-spring-collapse>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringCollapse } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringCollapse(); // registers <mo-spring-collapse>

/* then use it in your HTML:
<mo-spring-collapse label="What does damped mean?"><p>The motion overshoots a little, then settles instead of stopping dead.</p></mo-spring-collapse>
*/
```
