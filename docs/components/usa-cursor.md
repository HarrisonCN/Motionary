# `<usa-cursor>` — Custom cursor

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A spring-lagged ring, a magnetic ring that wraps buttons and links, or a soft glow following the pointer. Mouse / pen only. (6.0: for a comet tail use the comet-trail effect.)

- **Category:** page
- **Import:** `import { defineCursor } from 'motionary/components/page'` then `defineCursor();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** `mode`, `size`, `color`, `hide-native`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/page/cursor.ts](../../src/components/page/cursor.ts)

## Minimal example

```html
<usa-cursor mode="magnetic" hide-native></usa-cursor>
```

## ES module

```js
import { defineCursor } from 'motionary/components/page';

defineCursor(); // registers <usa-cursor>

/* then use it in your HTML:
<usa-cursor mode="magnetic" hide-native></usa-cursor>
*/
```
