# `<mo-search-bar>` — Expanding search bar

> Element name `<mo-search-bar>` (default since 17.3); the legacy name `<usa-search-bar>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A search button that widens into a field; / focuses it, suggestions follow the combobox pattern.

- **Category:** ui · **since** 17.11
- **Import:** `import { defineSearchBar } from 'motionary/components/widgets'` then `defineSearchBar();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `placeholder`, `suggestions`, `shortcut`, `expanded`, `width`, `name`
- **Events:** `usa:toggle`, `usa:search`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/search-bar.ts](../../src/components/widgets/search-bar.ts)

## Minimal example

```html
<mo-search-bar label="Search docs" suggestions="Sidebar, Search bar, Split pane, Scroll zoom"></mo-search-bar>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSearchBar } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSearchBar(); // registers <mo-search-bar>

/* then use it in your HTML:
<mo-search-bar label="Search docs" suggestions="Sidebar, Search bar, Split pane, Scroll zoom"></mo-search-bar>
*/
```
