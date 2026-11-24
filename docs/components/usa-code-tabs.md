# `<mo-code-tabs>` — Code tabs with copy

> Element name `<mo-code-tabs>` (default since 17.3); the legacy name `<usa-code-tabs>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

npm / pnpm / yarn tabs with a sliding underline and a copy button that turns into a tick; tabs in one group switch together.

- **Category:** ui · **since** 17.12
- **Import:** `import { defineCodeTabs } from 'motionary/components/widgets'` then `defineCodeTabs();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `index`, `group`, `label`, `copy-label`, `copied-label`
- **Events:** `usa:change`, `usa:copy`
- **Slots:** —
- **Methods:** `copy()`
- **Source:** [src/components/widgets/code-tabs.ts](../../src/components/widgets/code-tabs.ts)

## Minimal example

```html
<mo-code-tabs group="pm"><pre data-tab="npm">npm i motionary</pre><pre data-tab="pnpm">pnpm add motionary</pre><pre data-tab="yarn">yarn add motionary</pre></mo-code-tabs>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineCodeTabs } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineCodeTabs(); // registers <mo-code-tabs>

/* then use it in your HTML:
<mo-code-tabs group="pm"><pre data-tab="npm">npm i motionary</pre><pre data-tab="pnpm">pnpm add motionary</pre><pre data-tab="yarn">yarn add motionary</pre></mo-code-tabs>
*/
```
