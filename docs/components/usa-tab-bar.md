# `<usa-tab-bar>` — Tabs with animated indicator

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.2: the indicator stretches from the old tab to the new one (leading edge first) and the panel slides in from the side of travel. Pill, underline, glow or gooey; full tablist keyboard support.

- **Category:** ui · **since** 6.2
- **Import:** `import { defineTabBar } from 'motionary/components/widgets'` then `defineTabBar();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `indicator`, `label`, `selected`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `select()`
- **Source:** [src/components/widgets/tab-bar.ts](../../src/components/widgets/tab-bar.ts)

## Minimal example

```html
<usa-tab-bar indicator="pill">
  <button>Overview</button>
  <button>Specs</button>
  <button>Reviews</button>
  <div data-panel>…</div>
  <div data-panel>…</div>
  <div data-panel>…</div>
</usa-tab-bar>
```

## ES module

```js
import { defineTabBar } from 'motionary/components/widgets';

defineTabBar(); // registers <usa-tab-bar>

/* then use it in your HTML:
<usa-tab-bar indicator="pill">
  <button>Overview</button>
  <button>Specs</button>
  <button>Reviews</button>
  <div data-panel>…</div>
  <div data-panel>…</div>
  <div data-panel>…</div>
</usa-tab-bar>
*/
```
