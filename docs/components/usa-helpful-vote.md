# `<mo-helpful-vote>` — Was this helpful?

> Element name `<mo-helpful-vote>` (default since 17.3); the legacy name `<usa-helpful-vote>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Two thumb buttons that pop on a spring and turn into a thank-you; a No can ask what was missing.

- **Category:** ui · **since** 17.12
- **Import:** `import { defineHelpfulVote } from 'motionary/components/widgets'` then `defineHelpfulVote();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `question`, `yes-label`, `no-label`, `thanks`, `ask-why`, `why-label`, `send-label`
- **Events:** `usa:vote`, `usa:feedback`
- **Slots:** —
- **Methods:** `reset()`
- **Source:** [src/components/widgets/helpful-vote.ts](../../src/components/widgets/helpful-vote.ts)

## Minimal example

```html
<mo-helpful-vote ask-why></mo-helpful-vote>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineHelpfulVote } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineHelpfulVote(); // registers <mo-helpful-vote>

/* then use it in your HTML:
<mo-helpful-vote ask-why></mo-helpful-vote>
*/
```
