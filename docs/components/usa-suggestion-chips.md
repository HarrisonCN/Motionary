# `<mo-suggestion-chips>` — Suggestion chips

> Element name `<mo-suggestion-chips>` (default since 17.3); the legacy name `<usa-suggestion-chips>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.8: follow-up prompt chips that slide in one after another; picking one pulses it and (with dismiss) the others fade away. Real buttons, arrow-key navigation.

- **Category:** ui · **since** 7.8
- **Import:** `import { defineSuggestionChips } from 'motionary/components/widgets'` then `defineSuggestionChips();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `items`, `label`, `dismiss`
- **Events:** `usa:pick`
- **Slots:** —
- **Methods:** `setItems()`
- **Source:** [src/components/widgets/suggestion-chips.ts](../../src/components/widgets/suggestion-chips.ts)

## Minimal example

```html
<usa-suggestion-chips items="Summarise|Translate|Explain like I'm 5" dismiss></usa-suggestion-chips>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSuggestionChips } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSuggestionChips(); // registers <mo-suggestion-chips>

/* then use it in your HTML:
<mo-suggestion-chips items="Summarise|Translate|Explain like I'm 5" dismiss></mo-suggestion-chips>
*/
```
