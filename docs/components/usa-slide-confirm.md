# `<mo-slide-confirm>` — Slide to confirm

> Element name `<mo-slide-confirm>` (default since 17.3); the legacy name `<usa-slide-confirm>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A knob that follows the finger with rubber past the end, wobbles back if let go early and rides to the end past the threshold or on a hard flick. Enter confirms from the keyboard.

- **Category:** ui · **since** 17.19
- **Import:** `import { defineSlideConfirm } from 'motionary/components/widgets'` then `defineSlideConfirm();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `done`, `threshold`, `confirmed`, `disabled`, `feel`, `haptics`
- **Events:** `usa:confirm`, `usa:reset`
- **Slots:** —
- **Methods:** `confirm()`, `reset()`
- **Source:** [src/components/widgets/slide-confirm.ts](../../src/components/widgets/slide-confirm.ts)

## Minimal example

```html
<mo-slide-confirm label="Slide to pay" done="Paid"></mo-slide-confirm>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSlideConfirm } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSlideConfirm(); // registers <mo-slide-confirm>

/* then use it in your HTML:
<mo-slide-confirm label="Slide to pay" done="Paid"></mo-slide-confirm>
*/
```
