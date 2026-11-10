# `<mo-theme-switcher>` — Theme switcher

> Element name `<mo-theme-switcher>` (default since 17.3); the legacy name `<usa-theme-switcher>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.6: a segmented switcher for the 8.6 theme system — light, dark, neon, glass and soft (neumorphism); a pill slides under the active option and the page change is revealed with a circular wipe from the click point.

- **Category:** ui · **since** 8.6 · **changed in** 13.1
- **Import:** `import { defineThemeSwitcher } from 'motionary/components/widgets'` then `defineThemeSwitcher();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `themes`, `target`, `label`, `persist`, `value`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/theme-switcher.ts](../../src/components/widgets/theme-switcher.ts)

## Minimal example

```html
<usa-theme-switcher themes="light,dark,neon,glass,neu" persist></usa-theme-switcher>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineThemeSwitcher } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineThemeSwitcher(); // registers <mo-theme-switcher>

/* then use it in your HTML:
<mo-theme-switcher themes="light,dark,neon,glass,neu" persist></mo-theme-switcher>
*/
```
