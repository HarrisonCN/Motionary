# `<usa-menu-toggle>` — Hamburger → close

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.6: the three bars morph into a cross, a back arrow, a minus or a spinning plus-to-cross; a real toggle button with aria-expanded that can open the element it controls (for).

- **Category:** click · **since** 6.6
- **Import:** `import { defineMenuToggle } from 'motionary/components/widgets'` then `defineMenuToggle();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `variant`
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/menu-toggle.ts](../../src/components/widgets/menu-toggle.ts)

## Minimal example

```html
<usa-menu-toggle for="site-menu" variant="cross" label="Menu"></usa-menu-toggle>
<nav id="site-menu" hidden>…</nav>
```

## ES module

```js
import { defineMenuToggle } from 'motionary/components/widgets';

defineMenuToggle(); // registers <usa-menu-toggle>

/* then use it in your HTML:
<usa-menu-toggle for="site-menu" variant="cross" label="Menu"></usa-menu-toggle>
<nav id="site-menu" hidden>…</nav>
*/
```
