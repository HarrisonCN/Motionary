# `<mo-fling-tabs>` — Fling tabs

> Element name `<mo-fling-tabs>` (default since 17.3); the legacy name `<usa-fling-tabs>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Tabs whose panels you swipe between: the pill under the tab names follows the swipe, stretching between two tabs, and the panel height eases to the next panel's. A real tab list with arrow keys, Home and End.

- **Category:** ui · **since** 17.20
- **Import:** `import { defineFlingTabs } from 'motionary/components/widgets'` then `defineFlingTabs();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `index`, `label`, `feel`, `haptics`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/fling-tabs.ts](../../src/components/widgets/fling-tabs.ts)

## Minimal example

```html
<mo-fling-tabs label="Sections"><div data-tab="Overview"><p>Swipe the panel sideways, or tap a tab.</p></div><div data-tab="Specs"><p>The pill stretches between two tabs while you swipe.</p><p>And the height eases to fit.</p></div><div data-tab="Reviews"><p>Past the last tab the panel resists like rubber.</p></div></mo-fling-tabs>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFlingTabs } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFlingTabs(); // registers <mo-fling-tabs>

/* then use it in your HTML:
<mo-fling-tabs label="Sections"><div data-tab="Overview"><p>Swipe the panel sideways, or tap a tab.</p></div><div data-tab="Specs"><p>The pill stretches between two tabs while you swipe.</p><p>And the height eases to fit.</p></div><div data-tab="Reviews"><p>Past the last tab the panel resists like rubber.</p></div></mo-fling-tabs>
*/
```
