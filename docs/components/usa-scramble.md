# `<usa-scramble>` — Scramble / decode

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Decodes text out of random glyphs, left to right. Trigger on view, hover/focus or manually.

- **Category:** text · **since** 2.2
- **Import:** `import { defineScramble } from 'motionary/components/text'` then `defineScramble();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `text`, `trigger`, `duration`, `chars`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `play()`
- **Source:** [src/components/text/scramble.ts](../../src/components/text/scramble.ts)

## Minimal example

```html
<usa-scramble trigger="hover">ACCESS GRANTED</usa-scramble>
```

## ES module

```js
import { defineScramble } from 'motionary/components/text';

defineScramble(); // registers <usa-scramble>

/* then use it in your HTML:
<usa-scramble trigger="hover">ACCESS GRANTED</usa-scramble>
*/
```
