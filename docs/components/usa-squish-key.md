# `<mo-squish-key>` — <usa-squish-key>

> Element name `<mo-squish-key>` (default since 17.3); the legacy name `<usa-squish-key>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A soft, rubbery key: it sinks while held and wobbles back up past its rest height when let go. A native button carries pointer, Enter and Space; a click from assistive tech still gets a short dip.

- **Category:** widgets
- **Import:** `import { defineSquishKey } from 'motionary/components/widgets'` then `defineSquishKey();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `shape`, `tone`, `disabled`
- **Events:** `usa:press`
- **Slots:** —
- **Methods:** `press()`
- **Source:** [src/components/widgets/squish-key.ts](../../src/components/widgets/squish-key.ts)

## Minimal example

```html
<usa-squish-key></usa-squish-key>
```
