# `<mo-squish-key>` — Squish key

> Element name `<mo-squish-key>` (default since 17.3); the legacy name `<usa-squish-key>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A rubbery key that sinks while held and wobbles back past rest when let go.

- **Category:** click · **since** 17.9
- **Import:** `import { defineSquishKey } from 'motionary/components/widgets'` then `defineSquishKey();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `shape`, `tone`, `disabled`
- **Events:** `usa:press`
- **Slots:** —
- **Methods:** `press()`
- **Source:** [src/components/widgets/squish-key.ts](../../src/components/widgets/squish-key.ts)

## Minimal example

```html
<mo-squish-key label="A" shape="round"></mo-squish-key> <mo-squish-key label="B" shape="round" tone="light"></mo-squish-key>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSquishKey } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSquishKey(); // registers <mo-squish-key>

/* then use it in your HTML:
<mo-squish-key label="A" shape="round"></mo-squish-key> <mo-squish-key label="B" shape="round" tone="light"></mo-squish-key>
*/
```
