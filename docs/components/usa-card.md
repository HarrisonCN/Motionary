# `<usa-card>` — Card

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Ten card effects you can combine (effect="lift sheen"): flip (hover or click, x/y axis), holo, glass, border-glow, conic-border, lift, spotlight, sheen, parallax-layers and expand (card → detail with FLIP + spring).

- **Category:** cards
- **Import:** `import { defineCard } from 'motionary/components/cards'` then `defineCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `effect`, `trigger`, `disabled`, `color`, `depth`
- **Events:** `usa:flip`, `usa:expand`, `usa:collapse`
- **Slots:** —
- **Methods:** `flip()`, `expand()`, `collapse()`
- **Source:** [src/components/cards/card.ts](../../src/components/cards/card.ts)

## Minimal example

```html
<usa-card effect="lift sheen">
  <h3>Pro plan</h3>
</usa-card>
<usa-card effect="flip" trigger="click">
  <div data-front>Front</div>
  <div data-back>Back</div>
</usa-card>
<usa-card effect="expand">
  <h3>Title</h3>
  <div data-detail>Long text… <button data-close>Close</button></div>
</usa-card>
```

## ES module

```js
import { defineCard } from 'motionary/components/cards';

defineCard(); // registers <usa-card>

/* then use it in your HTML:
<usa-card effect="lift sheen">
  <h3>Pro plan</h3>
</usa-card>
<usa-card effect="flip" trigger="click">
  <div data-front>Front</div>
  <div data-back>Back</div>
</usa-card>
<usa-card effect="expand">
  <h3>Title</h3>
  <div data-detail>Long text… <button data-close>Close</button></div>
</usa-card>
*/
```

## Variants

### Card

Ten card effects you can combine (effect="lift sheen"): flip (hover or click, x/y axis), holo, glass, border-glow, conic-border, lift, spotlight, sheen, parallax-layers and expand (card → detail with FLIP + spring).

```html
<usa-card effect="lift sheen">
  <h3>Pro plan</h3>
</usa-card>
<usa-card effect="flip" trigger="click">
  <div data-front>Front</div>
  <div data-back>Back</div>
</usa-card>
<usa-card effect="expand">
  <h3>Title</h3>
  <div data-detail>Long text… <button data-close>Close</button></div>
</usa-card>
```

### Flip card

Front and back faces ([data-front] / [data-back]) flip in 3D on hover, or on click / Enter with trigger="click". axis="x" flips vertically. Reduced motion cross-fades.

```html
<usa-card effect="flip" trigger="click" axis="y">
  <div data-front>Front</div>
  <div data-back>Back</div>
</usa-card>
```

### Expand to detail

Click a card and it grows into a full detail view with a spring (FLIP); [data-detail] content appears. Esc, the backdrop or [data-close] collapses it back into place.

```html
<usa-card effect="expand">
  <h3>Title</h3>
  <div data-detail>…<button data-close>Close</button></div>
</usa-card>
```
