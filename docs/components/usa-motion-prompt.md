# `<usa-motion-prompt>` — Motion prompt (text → motion)

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.7 (AI-assisted motion): describe a motion in English or Chinese and get a live preview plus ready code — Web Animations, CSS (with a reduced-motion guard) or a Motionary component. A small deterministic parser (motionary/components/ai), no model and no network; the same parser powers suggest_motion in motionary-mcp 2.0.

- **Category:** ui · **since** 10.7
- **Import:** `import { defineMotionPrompt } from 'motionary/components/widgets'` then `defineMotionPrompt();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `value`, `format`, `placeholder`, `label`
- **Events:** `usa:suggest`, `usa:copy`
- **Slots:** —
- **Methods:** `suggest()`
- **Source:** [src/components/widgets/motion-prompt.ts](../../src/components/widgets/motion-prompt.ts)

## Minimal example

```html
<usa-motion-prompt value="fade the cards up slowly, one after another"></usa-motion-prompt>
```

## ES module

```js
import { defineMotionPrompt } from 'motionary/components/widgets';

defineMotionPrompt(); // registers <usa-motion-prompt>

/* then use it in your HTML:
<usa-motion-prompt value="fade the cards up slowly, one after another"></usa-motion-prompt>
*/
```
