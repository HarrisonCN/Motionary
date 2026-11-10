# `<mo-xp-bar>` — XP bar

> Element name `<mo-xp-bar>` (default since 17.3); the legacy name `<usa-xp-bar>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.5: an experience bar — add(n) fills it smoothly; overflowing fills to the end, the level badge pops and the bar restarts with the remainder (several levels if needed).

- **Category:** ui · **since** 7.5
- **Import:** `import { defineXpBar } from 'motionary/components/widgets'` then `defineXpBar();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `level`, `xp`, `per`
- **Events:** `usa:levelup`, `usa:xp`
- **Slots:** —
- **Methods:** `add()`
- **Source:** [src/components/widgets/xp-bar.ts](../../src/components/widgets/xp-bar.ts)

## Minimal example

```html
<usa-xp-bar level="3" xp="40" per="100"></usa-xp-bar>
<!-- +75 XP → level 4, 15 XP -->
<script>addEventListener('DOMContentLoaded', () => document.querySelector('usa-xp-bar').add(75));</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineXpBar } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineXpBar(); // registers <mo-xp-bar>

/* then use it in your HTML:
<mo-xp-bar level="3" xp="40" per="100"></mo-xp-bar>
<!-- +75 XP → level 4, 15 XP -->
*/
```
