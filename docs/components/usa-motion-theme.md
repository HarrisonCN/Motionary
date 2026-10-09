# `<usa-motion-theme>` — Theme packs

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

5.8: <usa-motion-theme name> applies a theme pack — design tokens (--usa-theme-*), motion tokens and effect presets per role (enter / hover / click / attention / background). Neon, paper, glass, retro and brutalist; applyMotionTheme() for the whole page.

- **Category:** fx
- **Import:** `import { defineMotionTheme } from 'motionary/components/effects'` then `defineMotionTheme();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** `name`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/effects/themes.ts](../../src/components/effects/themes.ts)

## Minimal example

```html
<usa-motion-theme name="neon">
  <div class="usa-surface">
    <button data-theme-fx="click">Tap</button>
  </div>
</usa-motion-theme>
```

## ES module

```js
import { defineMotionTheme } from 'motionary/components/effects';

defineMotionTheme(); // registers <usa-motion-theme>

/* then use it in your HTML:
<usa-motion-theme name="neon">
  <div class="usa-surface">
    <button data-theme-fx="click">Tap</button>
  </div>
</usa-motion-theme>
*/
```
