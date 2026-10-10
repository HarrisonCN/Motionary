# `<usa-pause-all>` — Pause all motion

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.5: one button that pauses all motion on the page (WCAG 2.2.2) — Motionary’s shared clock, every CSS / Web animation and autoplaying media — and resumes it again; `scope` limits it to one area.

- **Category:** ui · **since** 9.5
- **Import:** `import { definePauseAll } from 'motionary/components/widgets'` then `definePauseAll();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
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
import { definePauseAll } from 'motionary/components/widgets';

definePauseAll(); // registers <usa-pause-all>

/* then use it in your HTML:
<usa-pause-all></usa-pause-all>
*/
```
