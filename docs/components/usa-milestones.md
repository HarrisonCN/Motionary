# `<mo-milestones>` — Scroll-drawn milestones

> Element name `<mo-milestones>` (default since 17.3); the legacy name `<usa-milestones>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.5: a progress line grows down the rail as you scroll; each milestone pops its dot and slides its card in when the line reaches it. Alternating sides on wide screens, one column on phones; data-date labels.

- **Category:** timeline · **since** 6.5
- **Import:** `import { defineMilestones } from 'motionary/components/widgets'` then `defineMilestones();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `layout`
- **Events:** `usa:reach`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/milestones.ts](../../src/components/widgets/milestones.ts)

## Minimal example

```html
<usa-milestones>
  <div data-date="2024"><h3>Idea</h3><p>…</p></div>
  <div data-date="2025"><h3>Beta</h3><p>…</p></div>
  <div data-date="2026"><h3>Launch</h3><p>…</p></div>
</usa-milestones>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMilestones } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMilestones(); // registers <mo-milestones>

/* then use it in your HTML:
<mo-milestones>
  <div data-date="2024"><h3>Idea</h3><p>…</p></div>
  <div data-date="2025"><h3>Beta</h3><p>…</p></div>
  <div data-date="2026"><h3>Launch</h3><p>…</p></div>
</mo-milestones>
*/
```
