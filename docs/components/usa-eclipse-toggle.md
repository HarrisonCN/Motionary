# `<mo-eclipse-toggle>` — <usa-eclipse-toggle>

> Element name `<mo-eclipse-toggle>` (default since 17.3); the legacy name `<usa-eclipse-toggle>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A light / dark switch drawn as an eclipse: a disc slides over the sun, the rays retract and a thin corona stays. A native `<button role="switch">` handles pointer, Enter and Space. Attributes: `checked`, `label`, `disabled`. Event `usa:change` ({ checked }). It reports the state only; the page decides what dark means.

- **Category:** widgets
- **Import:** `import { defineEclipseToggle } from 'motionary/components/widgets'` then `defineEclipseToggle();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `checked`, `label`, `disabled`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/eclipse-toggle.ts](../../src/components/widgets/eclipse-toggle.ts)

## Minimal example

```html
<usa-eclipse-toggle></usa-eclipse-toggle>
```
