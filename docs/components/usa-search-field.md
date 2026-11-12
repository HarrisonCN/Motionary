# `<mo-search-field>` — Cancelable async search

> Element name `<mo-search-field>` (default since 17.3); the legacy name `<usa-search-field>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Debounced search providers with abort signals and protection against late results.

- **Category:** ui · **since** 17.7
- **Import:** `import { defineSearchField } from 'motionary/components/widgets'` then `defineSearchField();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `value`, `name`, `placeholder`, `delay`, `min-length`, `disabled`, `loading-text`, `empty-text`, `error-text`
- **Events:** `usa:input`, `usa:query`, `usa:results`, `usa:error`, `usa:select`
- **Slots:** —
- **Methods:** `search()`, `clear()`, `cancel()`, `reset()`
- **Source:** [src/components/widgets/search-field.ts](../../src/components/widgets/search-field.ts)

## Minimal example

```html
<mo-search-field label="Search collections" name="query" placeholder="Try portrait or city" delay="200"></mo-search-field>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSearchField } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSearchField(); // registers <mo-search-field>

/* then use it in your HTML:
<mo-search-field label="Search collections" name="query" placeholder="Try portrait or city" delay="200"></mo-search-field>
*/
```
