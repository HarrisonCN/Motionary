# `<mo-elastic-scroll>` — Elastic scroll

> Element name `<mo-elastic-scroll>` (default since 17.3); the legacy name `<usa-elastic-scroll>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A native scroll area whose ends stretch like rubber on wheel and touch and spring back with a damped settle; fires an edge event for pull-to-refresh.

- **Category:** ui · **since** 17.18
- **Import:** `import { defineElasticScroll } from 'motionary/components/widgets'` then `defineElasticScroll();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `height`, `label`, `feel`, `haptics`
- **Events:** `usa:edge`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/elastic-scroll.ts](../../src/components/widgets/elastic-scroll.ts)

## Minimal example

```html
<mo-elastic-scroll height="180px"><p>Scroll to the end, then keep going.</p><p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p></mo-elastic-scroll>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineElasticScroll } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineElasticScroll(); // registers <mo-elastic-scroll>

/* then use it in your HTML:
<mo-elastic-scroll height="180px"><p>Scroll to the end, then keep going.</p><p>1</p><p>2</p><p>3</p><p>4</p><p>5</p><p>6</p><p>7</p><p>8</p></mo-elastic-scroll>
*/
```
