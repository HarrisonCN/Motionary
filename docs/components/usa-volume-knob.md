# `<usa-volume-knob>` — Volume knob

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.1: a rotary knob — drag up / down, scroll or use the keys; the value arc fills, a ring of LED ticks lights up and the pointer springs to the angle. role="slider".

- **Category:** interaction · **since** 7.1
- **Import:** `import { defineVolumeKnob } from 'motionary/components/widgets'` then `defineVolumeKnob();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
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
import { defineVolumeKnob } from 'motionary/components/widgets';

defineVolumeKnob(); // registers <usa-volume-knob>

/* then use it in your HTML:
<usa-volume-knob value="60" label="Volume"></usa-volume-knob>
*/
```
