# motionary/runtime/format-scene — Scene JSON (motionary-scene@1)

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

The versioned motionary-scene@1 format: a JSON description of a 2D physics scene (world, named materials, bodies, constraints, per-body style) — validate, migrate older drafts, load into a physics world and save one back.

**Runtime tier:** advanced — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **3.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/format-scene`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/format-scene.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/format-scene.js`

4. **Import order & registration:** Register the core first, then the module: use(formatScene) also registers the core. CDN: load runtime.iife.js, then runtime/format-scene.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { formatScene } from 'motionary/runtime/format-scene';
use(formatScene);
```

## Example

```js
import { use } from 'motionary/runtime';
import { physics } from 'motionary/runtime/physics';
import { formatScene, sceneToWorld } from 'motionary/runtime/format-scene';
use(physics, formatScene);
const { world, bodies } = sceneToWorld(await (await fetch('/scenes/stack.json')).json());
world.run();
```

## Exports

`formatScene` · `SCENE_FORMAT` · `migrateScene` · `validateScene` · `parseScene` · `sceneToWorld` · `worldToScene`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| world: size, gravity, walls (with or without a top), solver iterations | ✅ yes |  |
| named materials (restitution, friction, density), per-body overrides | ✅ yes |  |
| bodies: circle / box / polygon, static / kinematic, velocity, angle, sensor, style | ✅ yes |  |
| constraints: distance / spring / pin between bodies or to a world point | ✅ yes |  |
| validation (lists every problem, never throws) + parseScene (throws one error) | ✅ yes |  |
| migration: unversioned scenes and the motionary-scene@0 draft → @1, with a change list | ✅ yes |  |
| save: worldToScene() (walls made by bounds() are left out) | ✅ yes |  |

## Components that need it

- `<usa-physics-playground>` — Physics playground
