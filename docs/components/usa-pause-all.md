# `<mo-pause-all>` — Pause all motion

> Element name `<mo-pause-all>` (default since 17.3); the legacy name `<usa-pause-all>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.5: one button that pauses all motion on the page (WCAG 2.2.2) — Motionary’s shared clock, every CSS / Web animation and autoplaying media — and resumes it again; `scope` limits it to one area.

- **Category:** ui · **since** 9.5
- **Import:** `import { definePauseAll } from 'motionary/components/widgets'` then `definePauseAll();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `scope`, `resume-label`
- **Events:** `usa:pause-all`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/pause-all.ts](../../src/components/widgets/pause-all.ts)

## Minimal example

```html
<usa-pause-all></usa-pause-all>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePauseAll } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePauseAll(); // registers <mo-pause-all>

/* then use it in your HTML:
<mo-pause-all></mo-pause-all>
*/
```
