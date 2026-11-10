# `<mo-volume-knob>` — Volume knob

> Element name `<mo-volume-knob>` (default since 17.3); the legacy name `<usa-volume-knob>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.1: a rotary knob — drag up / down, scroll or use the keys; the value arc fills, a ring of LED ticks lights up and the pointer springs to the angle. role="slider".

- **Category:** interaction · **since** 7.1
- **Import:** `import { defineVolumeKnob } from 'motionary/components/widgets'` then `defineVolumeKnob();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `min`, `max`, `label`
- **Events:** `usa:change`, `usa:input`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/volume-knob.ts](../../src/components/widgets/volume-knob.ts)

## Minimal example

```html
<usa-volume-knob value="60" label="Volume"></usa-volume-knob>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineVolumeKnob } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineVolumeKnob(); // registers <mo-volume-knob>

/* then use it in your HTML:
<mo-volume-knob value="60" label="Volume"></mo-volume-knob>
*/
```
