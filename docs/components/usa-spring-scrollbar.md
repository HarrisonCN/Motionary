# `<mo-spring-scrollbar>` — Spring scrollbar

> Element name `<mo-spring-scrollbar>` (default since 17.3); the legacy name `<usa-spring-scrollbar>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A scroll area with a slim thumb on a spring: it trails the scroll, squashes at the ends and fades when idle. Drag it to scroll fast with a bubble naming the section.

- **Category:** ui · **since** 17.19
- **Import:** `import { defineSpringScrollbar } from 'motionary/components/widgets'` then `defineSpringScrollbar();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `height`, `label`, `feel`
- **Events:** `usa:section`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/spring-scrollbar.ts](../../src/components/widgets/spring-scrollbar.ts)

## Minimal example

```html
<mo-spring-scrollbar height="200px"><h3>Intro</h3><p>Scroll, then drag the thin bar on the right.</p><h3>Springs</h3><p>The thumb trails a moment and settles.</p><h3>Ends</h3><p>Push past an end and it squashes.</p><h3>Idle</h3><p>It fades out when you stop.</p></mo-spring-scrollbar>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringScrollbar } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringScrollbar(); // registers <mo-spring-scrollbar>

/* then use it in your HTML:
<mo-spring-scrollbar height="200px"><h3>Intro</h3><p>Scroll, then drag the thin bar on the right.</p><h3>Springs</h3><p>The thumb trails a moment and settles.</p><h3>Ends</h3><p>Push past an end and it squashes.</p><h3>Idle</h3><p>It fades out when you stop.</p></mo-spring-scrollbar>
*/
```
