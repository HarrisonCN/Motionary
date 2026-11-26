# `<mo-spring-sheet>` — Spring sheet

> Element name `<mo-spring-sheet>` (default since 17.3); the legacy name `<usa-spring-sheet>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A bottom sheet with snap points: it follows the finger, stretches past its top, and a release is carried by its speed to a snap or closed.

- **Category:** ui · **since** 17.18
- **Import:** `import { defineSpringSheet } from 'motionary/components/widgets'` then `defineSpringSheet();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `snaps`, `open`, `label`, `trigger`, `feel`, `haptics`
- **Events:** `usa:snap`
- **Slots:** —
- **Methods:** `show()`, `close()`
- **Source:** [src/components/widgets/spring-sheet.ts](../../src/components/widgets/spring-sheet.ts)

## Minimal example

```html
<mo-spring-sheet snaps="0.45, 0.9" style="--usa-dsheet-height:300px"><p>Page content</p><div data-sheet><h3>Filters</h3><p>Drag the handle, or flick it down to close.</p></div></mo-spring-sheet>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringSheet } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringSheet(); // registers <mo-spring-sheet>

/* then use it in your HTML:
<mo-spring-sheet snaps="0.45, 0.9" style="--usa-dsheet-height:300px"><p>Page content</p><div data-sheet><h3>Filters</h3><p>Drag the handle, or flick it down to close.</p></div></mo-spring-sheet>
*/
```
