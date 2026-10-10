# `<usa-retro-button>` — Retro buttons

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.2: buttons in four eras with matching press motion — 8-bit pixel (stepped press), CRT phosphor (flicker), Y2K chrome pill (bounce) and Windows 95 bevel (sink).

- **Category:** ui · **since** 8.2
- **Import:** `import { defineRetroButton } from 'motionary/components/widgets'` then `defineRetroButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `variant`, `disabled`, `type`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/retro-button.ts](../../src/components/widgets/retro-button.ts)

## Minimal example

```html
<usa-retro-button variant="pixel">Start</usa-retro-button>
<usa-retro-button variant="win95">OK</usa-retro-button>
```

## ES module

```js
import { defineRetroButton } from 'motionary/components/widgets';

defineRetroButton(); // registers <usa-retro-button>

/* then use it in your HTML:
<usa-retro-button variant="pixel">Start</usa-retro-button>
<usa-retro-button variant="win95">OK</usa-retro-button>
*/
```
