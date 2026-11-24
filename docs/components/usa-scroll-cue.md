# `<mo-scroll-cue>` — Scroll cue

> Element name `<mo-scroll-cue>` (default since 17.3); the legacy name `<usa-scroll-cue>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A mouse, chevrons or a falling line that invites a scroll and fades once the page moves.

- **Category:** page · **since** 17.11
- **Import:** `import { defineScrollCue } from 'motionary/components/widgets'` then `defineScrollCue();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `kind`, `label`, `target`, `hide-after`, `text`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/scroll-cue.ts](../../src/components/widgets/scroll-cue.ts)

## Minimal example

```html
<mo-scroll-cue kind="mouse" text="Scroll"></mo-scroll-cue>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineScrollCue } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineScrollCue(); // registers <mo-scroll-cue>

/* then use it in your HTML:
<mo-scroll-cue kind="mouse" text="Scroll"></mo-scroll-cue>
*/
```
