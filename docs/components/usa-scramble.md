# `<mo-scramble>` — Scramble / decode

> Element name `<mo-scramble>` (default since 17.3); the legacy name `<usa-scramble>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Decodes text out of random glyphs, left to right. Trigger on view, hover/focus or manually.

- **Category:** text · **since** 2.2
- **Import:** `import { defineScramble } from 'motionary/components/text'` then `defineScramble();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineScramble } from 'motionary/components/text';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineScramble(); // registers <mo-scramble>

/* then use it in your HTML:
<mo-scramble trigger="hover">ACCESS GRANTED</mo-scramble>
*/
```
