# `<mo-orbit-progress>` — Orbit progress dial

> Element name `<mo-orbit-progress>` (default since 17.3); the legacy name `<usa-orbit-progress>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A bounded, determinate glass progress dial. Smooth updates, accessible values and no idle animation.

- **Category:** ui · **since** 17.4
- **Import:** `import { defineOrbitProgress } from 'motionary/components/widgets'` then `defineOrbitProgress();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `max`, `label`, `theme`
- **Events:** —
- **Slots:** —
- **Methods:** `changed()`, `mount()`, `luminousTheme()`, `defineMoName()`
- **Source:** [src/components/widgets/orbit-progress.ts](../../src/components/widgets/orbit-progress.ts)

## Minimal example

```html
<mo-orbit-progress value="65" label="Export progress"></mo-orbit-progress>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineOrbitProgress } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineOrbitProgress(); // registers <mo-orbit-progress>

/* then use it in your HTML:
<mo-orbit-progress value="65" label="Export progress"></mo-orbit-progress>
*/
```
