# `<mo-physics-playground>` — Physics playground

> Element name `<mo-physics-playground>` (default since 17.3); the legacy name `<usa-physics-playground>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.7: a 2D rigid-body sandbox on Motionary’s own physics engine — circles, boxes and polygons, friction, restitution, constraints, sleeping — loaded from a versioned motionary-scene@1 JSON (or a preset: balls, pyramid, pendulum, dominoes). Drag bodies, tap to spawn, arrow keys nudge. Requires motionary/runtime/physics + motionary/runtime/format-scene — npm i motionary, then use(physics, formatScene) before it mounts.

- **Category:** ui · **since** 10.7
- **Import:** `import { definePhysicsPlayground } from 'motionary/components/widgets'` then `definePhysicsPlayground();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `preset`, `src`, `gravity`, `spawn`, `label`
- **Events:** `usa:collision`, `usa:load`, `usa:error`, `usa:runtime-missing`
- **Slots:** —
- **Methods:** `reset()`, `play()`, `pause()`, `toScene()`
- **Source:** [src/components/widgets/physics-playground.ts](../../src/components/widgets/physics-playground.ts)

## Prerequisites — Requires: motionary/runtime/physics + motionary/runtime/format-scene

1. **Install:** `npm i motionary`
2. **Import order & registration:** Register the core first, then the module: use(physics) also registers the core. CDN: load runtime.iife.js, then runtime/physics.iife.js (it registers itself). Register the core first, then the module: use(formatScene) also registers the core. CDN: load runtime.iife.js, then runtime/format-scene.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { physics } from 'motionary/runtime/physics';
import { formatScene } from 'motionary/runtime/format-scene';
import { definePhysicsPlayground } from 'motionary/components/widgets';

use(physics, formatScene);
definePhysicsPlayground(); // registers <usa-physics-playground> — after the prerequisites
```

3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime/physics.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime/format-scene.iife.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>
```

## Minimal example

```html
<usa-physics-playground preset="pyramid" spawn label="Knock the pyramid over"></usa-physics-playground>
```

## ES module

```js
import { use } from 'motionary/runtime';
import { physics } from 'motionary/runtime/physics';
import { formatScene } from 'motionary/runtime/format-scene';

use(physics, formatScene);
import { defineMoAliases } from 'motionary/components/mo';
import { definePhysicsPlayground } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePhysicsPlayground(); // registers <mo-physics-playground>

/* then use it in your HTML:
<mo-physics-playground preset="pyramid" spawn label="Knock the pyramid over"></mo-physics-playground>
*/
```
