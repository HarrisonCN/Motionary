# `<mo-pixel-transition>` — Pixel transition

> Element name `<mo-pixel-transition>` (default since 17.3); the legacy name `<usa-pixel-transition>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Square pixels blink in at random to cover a card, the faces swap, and the pixels blink out.

- **Category:** click · **since** 17.13
- **Import:** `import { definePixelTransition } from 'motionary/components/widgets'` then `definePixelTransition();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `grid`, `color`, `duration`, `trigger`, `flipped`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/pixel-transition.ts](../../src/components/widgets/pixel-transition.ts)

## Minimal example

```html
<mo-pixel-transition><div style="padding:40px 20px;text-align:center;background:#eef2ff">Hover me</div><div style="padding:40px 20px;text-align:center;background:#fde68a">Hello 👋</div></mo-pixel-transition>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePixelTransition } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePixelTransition(); // registers <mo-pixel-transition>

/* then use it in your HTML:
<mo-pixel-transition><div style="padding:40px 20px;text-align:center;background:#eef2ff">Hover me</div><div style="padding:40px 20px;text-align:center;background:#fde68a">Hello 👋</div></mo-pixel-transition>
*/
```
