# `<mo-typewriter>` — Typewriter

> Element name `<mo-typewriter>` (default since 17.3); the legacy name `<usa-typewriter>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Types text, or cycles through phrases with delete and pause. Full text stays available to screen readers.

- **Category:** text · **since** 2.2
- **Import:** `import { defineTypewriter } from 'motionary/components/text'` then `defineTypewriter();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `text`, `words`, `start`, `speed`, `delete-speed`, `pause`, `loop`, `delay`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `start()`, `stop()`, `restart()`
- **Source:** [src/components/text/typewriter.ts](../../src/components/text/typewriter.ts)

## Minimal example

```html
<usa-typewriter words="Hello, Windows.|Hello, web." loop></usa-typewriter>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTypewriter } from 'motionary/components/text';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTypewriter(); // registers <mo-typewriter>

/* then use it in your HTML:
<mo-typewriter words="Hello, Windows.|Hello, web." loop></mo-typewriter>
*/
```
