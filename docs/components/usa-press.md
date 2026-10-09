# `<usa-press>` — Press feedback

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Tactile press: dips while pressed and springs back, or bounces once with bounce. Mouse, touch, pen and keyboard.

- **Category:** interaction
- **Import:** `import { definePress } from 'motionary/components/interaction'` then `definePress();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** `disabled`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/interaction/press.ts](../../src/components/interaction/press.ts)

## Minimal example

```html
<usa-press bounce><button>Press</button></usa-press>
```

## ES module

```js
import { definePress } from 'motionary/components/interaction';

definePress(); // registers <usa-press>

/* then use it in your HTML:
<usa-press bounce><button>Press</button></usa-press>
*/
```
