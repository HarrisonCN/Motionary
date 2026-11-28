# `<mo-spring-grid>` — Spring grid

> Element name `<mo-spring-grid>` (default since 17.3); the legacy name `<usa-spring-grid>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A grid of tiles you rearrange by dragging, like a phone's home screen: the lifted tile follows the finger and the others slide out of its way on springs. Touch holds to lift; Space picks up and arrows move from the keyboard.

- **Category:** ui · **since** 17.20
- **Import:** `import { defineSpringGrid } from 'motionary/components/widgets'` then `defineSpringGrid();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `columns`, `gap`, `row-height`, `label`, `feel`, `haptics`
- **Events:** `usa:reorder`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/spring-grid.ts](../../src/components/widgets/spring-grid.ts)

## Minimal example

```html
<mo-spring-grid columns="4" label="Apps"><div data-key="mail" data-label="Mail">✉️</div><div data-key="maps" data-label="Maps">🗺️</div><div data-key="music" data-label="Music">🎵</div><div data-key="photos" data-label="Photos">🖼️</div><div data-key="notes" data-label="Notes">📝</div><div data-key="clock" data-label="Clock">⏰</div><div data-key="camera" data-label="Camera">📷</div><div data-key="games" data-label="Games">🎮</div></mo-spring-grid>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringGrid } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringGrid(); // registers <mo-spring-grid>

/* then use it in your HTML:
<mo-spring-grid columns="4" label="Apps"><div data-key="mail" data-label="Mail">✉️</div><div data-key="maps" data-label="Maps">🗺️</div><div data-key="music" data-label="Music">🎵</div><div data-key="photos" data-label="Photos">🖼️</div><div data-key="notes" data-label="Notes">📝</div><div data-key="clock" data-label="Clock">⏰</div><div data-key="camera" data-label="Camera">📷</div><div data-key="games" data-label="Games">🎮</div></mo-spring-grid>
*/
```
