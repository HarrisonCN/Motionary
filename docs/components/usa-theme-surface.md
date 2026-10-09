# `<usa-theme-surface>` — Theme surface

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.6: a themeable card that follows the nearest theme — light, dark, neon (pulsing glow edge), glass (frosted backdrop with a sheen) or soft neumorphic relief — and cross-fades when the theme changes.

- **Category:** ui · **since** 8.6
- **Import:** `import { defineThemeSurface } from 'motionary/components/widgets'` then `defineThemeSurface();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `theme`
- **Events:** `usa:theme`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/theme-surface.ts](../../src/components/widgets/theme-surface.ts)

## Minimal example

```html
<usa-theme-surface theme="glass">
  <h3>Frosted</h3><p>Content…</p>
</usa-theme-surface>
```

## ES module

```js
import { defineThemeSurface } from 'motionary/components/widgets';

defineThemeSurface(); // registers <usa-theme-surface>

/* then use it in your HTML:
<usa-theme-surface theme="glass">
  <h3>Frosted</h3><p>Content…</p>
</usa-theme-surface>
*/
```
