# `<usa-ripple>` — Ripple

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Ink ripple from the pointer — or from the centre for Space/Enter — on any button, list item or card.

- **Category:** interaction
- **Import:** `import { defineRipple } from 'motionary/components/interaction'` then `defineRipple();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `disabled`, `centered`, `color`, `opacity`, `duration`
- **Events:** —
- **Slots:** —
- **Methods:** `ripple()`
- **Source:** [src/components/interaction/ripple.ts](../../src/components/interaction/ripple.ts)

## Minimal example

```html
<usa-ripple><button>Click me</button></usa-ripple>
```

## ES module

```js
import { defineRipple } from 'motionary/components/interaction';

defineRipple(); // registers <usa-ripple>

/* then use it in your HTML:
<usa-ripple><button>Click me</button></usa-ripple>
*/
```
