# `<mo-progress-tabs>` — Autoplay feature tabs

> Element name `<mo-progress-tabs>` (default since 17.3); the legacy name `<usa-progress-tabs>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Feature tabs that fill a progress bar and open the next tab when it is full; pauses on hover, focus or off screen.

- **Category:** ui · **since** 17.12
- **Import:** `import { defineProgressTabs } from 'motionary/components/widgets'` then `defineProgressTabs();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `index`, `interval`, `label`, `pause-label`, `play-label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `select()`
- **Source:** [src/components/widgets/progress-tabs.ts](../../src/components/widgets/progress-tabs.ts)

## Minimal example

```html
<mo-progress-tabs interval="4000"><section data-tab="Fast"><p>Ships in one tag.</p></section><section data-tab="Small"><p>A few KB each.</p></section><section data-tab="Kind"><p>Respects reduced motion.</p></section></mo-progress-tabs>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineProgressTabs } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineProgressTabs(); // registers <mo-progress-tabs>

/* then use it in your HTML:
<mo-progress-tabs interval="4000"><section data-tab="Fast"><p>Ships in one tag.</p></section><section data-tab="Small"><p>A few KB each.</p></section><section data-tab="Kind"><p>Respects reduced motion.</p></section></mo-progress-tabs>
*/
```
