# `<mo-swing-sign>` — Swing sign

> Element name `<mo-swing-sign>` (default since 17.3); the legacy name `<usa-swing-sign>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A sign hanging from a nail on two strings that swings as a real pendulum: drag it and let go, or brush past it with the mouse. A click turns it over to the back with a flip and a small swing.

- **Category:** ui · **since** 17.20
- **Import:** `import { defineSwingSign } from 'motionary/components/widgets'` then `defineSwingSign();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `flipped`, `length`, `label`, `feel`, `haptics`
- **Events:** `usa:flip`
- **Slots:** —
- **Methods:** `swing()`
- **Source:** [src/components/widgets/swing-sign.ts](../../src/components/widgets/swing-sign.ts)

## Minimal example

```html
<mo-swing-sign label="Shop sign"><strong style="font-size:1.4rem">OPEN</strong><strong data-back style="font-size:1.4rem">CLOSED</strong></mo-swing-sign>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSwingSign } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSwingSign(); // registers <mo-swing-sign>

/* then use it in your HTML:
<mo-swing-sign label="Shop sign"><strong style="font-size:1.4rem">OPEN</strong><strong data-back style="font-size:1.4rem">CLOSED</strong></mo-swing-sign>
*/
```
