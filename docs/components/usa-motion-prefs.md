# `<usa-motion-prefs>` — Motion preference panel

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.5: a motion settings panel for your users — motion level (full, gentle, minimal, none), animation speed, pause autoplaying video, no parallax — applied instantly to every Motionary animation and remembered.

- **Category:** ui · **since** 9.5
- **Import:** `import { defineMotionPrefs } from 'motionary/components/widgets'` then `defineMotionPrefs();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `label`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `reset()`
- **Source:** [src/components/widgets/motion-prefs.ts](../../src/components/widgets/motion-prefs.ts)

## Minimal example

```html
<usa-motion-prefs></usa-motion-prefs>
```

## ES module

```js
import { defineMotionPrefs } from 'motionary/components/widgets';

defineMotionPrefs(); // registers <usa-motion-prefs>

/* then use it in your HTML:
<usa-motion-prefs></usa-motion-prefs>
*/
```
