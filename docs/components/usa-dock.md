# `<mo-dock>` — macOS-style dock

> Element name `<mo-dock>` (default since 17.3); the legacy name `<usa-dock>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.6: items magnify with a smooth cosine falloff as the pointer moves along the dock, neighbours make room, labels pop above the hovered item and a click bounces it. Keyboard focus magnifies too.

- **Category:** ui · **since** 6.6
- **Import:** `import { defineDock } from 'motionary/components/widgets'` then `defineDock();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
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
import { defineMoAliases } from 'motionary/components/mo';
import { defineDock } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDock(); // registers <mo-dock>

/* then use it in your HTML:
<mo-dock magnify="1.9" bounce label="Apps">
  <button data-label="Finder" aria-label="Finder">🗂</button>
  <button data-label="Music" aria-label="Music">🎵</button>
  <a href="/mail" data-label="Mail" aria-label="Mail">✉️</a>
</mo-dock>
*/
```
