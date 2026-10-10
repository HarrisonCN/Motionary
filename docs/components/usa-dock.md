# `<usa-dock>` — macOS-style dock

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.6: items magnify with a smooth cosine falloff as the pointer moves along the dock, neighbours make room, labels pop above the hovered item and a click bounces it. Keyboard focus magnifies too.

- **Category:** ui · **since** 6.6
- **Import:** `import { defineDock } from 'motionary/components/widgets'` then `defineDock();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `orientation`, `magnify`, `range`, `label`, `bounce`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/dock.ts](../../src/components/widgets/dock.ts)

## Minimal example

```html
<usa-dock magnify="1.9" bounce label="Apps">
  <button data-label="Finder" aria-label="Finder">🗂</button>
  <button data-label="Music" aria-label="Music">🎵</button>
  <a href="/mail" data-label="Mail" aria-label="Mail">✉️</a>
</usa-dock>
```

## ES module

```js
import { defineDock } from 'motionary/components/widgets';

defineDock(); // registers <usa-dock>

/* then use it in your HTML:
<usa-dock magnify="1.9" bounce label="Apps">
  <button data-label="Finder" aria-label="Finder">🗂</button>
  <button data-label="Music" aria-label="Music">🎵</button>
  <a href="/mail" data-label="Mail" aria-label="Mail">✉️</a>
</usa-dock>
*/
```
