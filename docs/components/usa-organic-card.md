# `<usa-organic-card>` — Organic card

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.3: a card with a soft, living blob shape — its outline slowly breathes on screen, morphs on hover and comes in leaf, ocean, petal and sand tints.

- **Category:** ui · **since** 8.3
- **Import:** `import { defineOrganicCard } from 'motionary/components/widgets'` then `defineOrganicCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `tint`, `seed`
- **Events:** —
- **Slots:** —
- **Methods:** `morph()`
- **Source:** [src/components/widgets/organic-card.ts](../../src/components/widgets/organic-card.ts)

## Minimal example

```html
<usa-organic-card tint="ocean">
  <h3>Deep sea</h3><p>Content…</p>
</usa-organic-card>
```

## ES module

```js
import { defineOrganicCard } from 'motionary/components/widgets';

defineOrganicCard(); // registers <usa-organic-card>

/* then use it in your HTML:
<usa-organic-card tint="ocean">
  <h3>Deep sea</h3><p>Content…</p>
</usa-organic-card>
*/
```
