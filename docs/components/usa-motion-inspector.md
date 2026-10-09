# `<usa-motion-inspector>` — Motion inspector

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.2: a live panel listing the running animations in a scope (CSS animations, transitions, element.animate(), components) with state and progress, plus the motionary/runtime ticker when present — pause / play all, 0.25× slow motion and per-row scrub.

- **Category:** ui · **since** 10.2
- **Import:** `import { defineMotionInspector } from 'motionary/components/widgets'` then `defineMotionInspector();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `scope`, `interval`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `refresh()`, `pauseAll()`, `playAll()`, `setRate()`, `animations()`
- **Source:** [src/components/widgets/motion-inspector.ts](../../src/components/widgets/motion-inspector.ts)

## Minimal example

```html
<usa-motion-inspector scope="#app" interval="500"></usa-motion-inspector>
```

## ES module

```js
import { defineMotionInspector } from 'motionary/components/widgets';

defineMotionInspector(); // registers <usa-motion-inspector>

/* then use it in your HTML:
<usa-motion-inspector scope="#app" interval="500"></usa-motion-inspector>
*/
```
