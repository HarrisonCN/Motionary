# `<mo-festival-banner>` — Festival banner

> Element name `<mo-festival-banner>` (default since 17.3); the legacy name `<usa-festival-banner>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.1: an announcement banner with an ambient festive scene behind the text — lunar lanterns and sparkles, Christmas lights and snow, Halloween bats and moon, or fireworks.

- **Category:** ui · **since** 8.1
- **Import:** `import { defineFestivalBanner } from 'motionary/components/widgets'` then `defineFestivalBanner();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `theme`, `label`, `dismissible`
- **Events:** `usa:dismiss`
- **Slots:** —
- **Methods:** `dismiss()`
- **Source:** [src/components/widgets/festival-banner.ts](../../src/components/widgets/festival-banner.ts)

## Minimal example

```html
<usa-festival-banner theme="lunar" dismissible>🧧 Happy Lunar New Year — 20% off all week</usa-festival-banner>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFestivalBanner } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFestivalBanner(); // registers <mo-festival-banner>

/* then use it in your HTML:
<mo-festival-banner theme="lunar" dismissible>🧧 Happy Lunar New Year — 20% off all week</mo-festival-banner>
*/
```
