# `<mo-scratch-card>` — Scratch card

> Element name `<mo-scratch-card>` (default since 17.3); the legacy name `<usa-scratch-card>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Rub away a foil to reveal what is underneath; sparkles trail the scratch and a Reveal button uncovers it in one go.

- **Category:** gesture · **since** 17.13
- **Import:** `import { defineScratchCard } from 'motionary/components/widgets'` then `defineScratchCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `color`, `label`, `reveal-label`, `threshold`, `brush`
- **Events:** `usa:reveal`
- **Slots:** —
- **Methods:** `reveal()`
- **Source:** [src/components/widgets/scratch-card.ts](../../src/components/widgets/scratch-card.ts)

## Minimal example

```html
<mo-scratch-card><p><strong>20% off</strong><br>Code SPRING</p></mo-scratch-card>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineScratchCard } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineScratchCard(); // registers <mo-scratch-card>

/* then use it in your HTML:
<mo-scratch-card><p><strong>20% off</strong><br>Code SPRING</p></mo-scratch-card>
*/
```
