# `<usa-text-splitter>` — Text splitter

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.3: splits its text into characters, words or lines and animates them in with a stagger (rise, fade, blur, flip, wave) when it scrolls into view — accessible, grapheme-aware. Requires motionary/runtime/text — npm i motionary, then use(text) before it mounts.

- **Category:** text · **since** 10.3
- **Import:** `import { defineTextSplitter } from 'motionary/components/widgets'` then `defineTextSplitter();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `split`, `effect`, `stagger`, `duration`, `loop`, `trigger`
- **Events:** `usa:split`, `usa:done`, `usa:runtime-missing`
- **Slots:** —
- **Methods:** `replay()`, `pieces()`
- **Source:** [src/components/widgets/text-splitter.ts](../../src/components/widgets/text-splitter.ts)

## Prerequisites — Requires: motionary/runtime/text

1. **Install:** `npm i motionary`
2. **Import order & registration:** Register the core first, then the module: use(text) also registers the core. CDN: load runtime.iife.js, then runtime/text.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { text } from 'motionary/runtime/text';
import { defineTextSplitter } from 'motionary/components/widgets';

use(text);
defineTextSplitter(); // registers <usa-text-splitter> — after the prerequisites
```

3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/text.iife.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>
```

## Minimal example

```html
<usa-text-splitter split="chars" effect="rise" stagger="30">Motion, made simple.</usa-text-splitter>
```

## ES module

```js
import { use } from 'motionary/runtime';
import { text } from 'motionary/runtime/text';

use(text);
import { defineTextSplitter } from 'motionary/components/widgets';

defineTextSplitter(); // registers <usa-text-splitter>

/* then use it in your HTML:
<usa-text-splitter split="chars" effect="rise" stagger="30">Motion, made simple.</usa-text-splitter>
*/
```
