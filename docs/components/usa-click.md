# `<usa-click>` — Click effects

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Wrap anything: ripple, burst (circle, star, heart, emoji), confetti, squish, press-spring and error shake — combinable, keyboard-friendly, optional haptics.

- **Category:** click · **since** 2.5
- **Import:** `import { defineClick } from 'motionary/components/click'` then `defineClick();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `effect`, `disabled`, `trigger`, `color`, `count`, `shape`, `haptic`
- **Events:** `usa:click-effect`
- **Slots:** —
- **Methods:** `play()`, `shake()`
- **Source:** [src/components/click/click.ts](../../src/components/click/click.ts)

## Minimal example

```html
<usa-click effect="press-spring burst" shape="star">
  <button>Celebrate</button>
</usa-click>
```

## ES module

```js
import { defineClick } from 'motionary/components/click';

defineClick(); // registers <usa-click>

/* then use it in your HTML:
<usa-click effect="press-spring burst" shape="star">
  <button>Celebrate</button>
</usa-click>
*/
```
