# `<mo-theme-surface>` — Theme surface

> Element name `<mo-theme-surface>` (default since 17.3); the legacy name `<usa-theme-surface>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.6: a themeable card that follows the nearest theme — light, dark, neon (pulsing glow edge), glass (frosted backdrop with a sheen) or soft neumorphic relief — and cross-fades when the theme changes.

- **Category:** ui · **since** 8.6
- **Import:** `import { defineThemeSurface } from 'motionary/components/widgets'` then `defineThemeSurface();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineThemeSurface } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineThemeSurface(); // registers <mo-theme-surface>

/* then use it in your HTML:
<mo-theme-surface theme="glass">
  <h3>Frosted</h3><p>Content…</p>
</mo-theme-surface>
*/
```
