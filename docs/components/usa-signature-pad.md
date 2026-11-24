# `<mo-signature-pad>` — Signature pad

> Element name `<mo-signature-pad>` (default since 17.3); the legacy name `<usa-signature-pad>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Draw a signature with mouse, pen or finger; strokes are smoothed and thin out when fast. Undo, clear, or type a name instead.

- **Category:** gesture · **since** 17.13
- **Import:** `import { defineSignaturePad } from 'motionary/components/widgets'` then `defineSignaturePad();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `color`, `width`, `name`, `clear-label`, `undo-label`, `type-label`, `placeholder`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `clear()`, `undo()`, `toDataURL()`
- **Source:** [src/components/widgets/signature-pad.ts](../../src/components/widgets/signature-pad.ts)

## Minimal example

```html
<mo-signature-pad name="signature"></mo-signature-pad>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSignaturePad } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSignaturePad(); // registers <mo-signature-pad>

/* then use it in your HTML:
<mo-signature-pad name="signature"></mo-signature-pad>
*/
```
