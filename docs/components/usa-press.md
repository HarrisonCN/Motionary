# `<mo-press>` — Press feedback

> Element name `<mo-press>` (default since 17.3); the legacy name `<usa-press>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Tactile press: dips while pressed and springs back, or bounces once with bounce. Mouse, touch, pen and keyboard.

- **Category:** interaction · **since** 2.2
- **Import:** `import { definePress } from 'motionary/components/interaction'` then `definePress();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `disabled`, `scale`, `bounce`
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
import { defineMoAliases } from 'motionary/components/mo';
import { definePress } from 'motionary/components/interaction';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePress(); // registers <mo-press>

/* then use it in your HTML:
<mo-press bounce><button>Press</button></mo-press>
*/
```
