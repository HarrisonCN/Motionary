# motionary/runtime/physics — 2D rigid-body physics

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

A small 2D rigid-body engine written for Motionary (own implementation and API — no Matter.js / Box2D code): circles, boxes and convex polygons, mass from density, restitution, friction, sensors, collision groups, sleeping, distance / spring / pin constraints, pointer drag, a fixed time step on the shared ticker.

Part of Motionary's own zero-dependency runtime. Size budget: **10.0 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/physics`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/physics.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/physics.js`

4. **Import order & registration:** Register the core first, then the module: use(physics) also registers the core. CDN: load runtime.iife.js, then runtime/physics.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { physics } from 'motionary/runtime/physics';
use(physics);
```

## Example

```js
import { use } from 'motionary/runtime';
import { physics, createWorld } from 'motionary/runtime/physics';
use(physics);
const world = createWorld({ gravity: [0, 980] });
world.bounds(600, 400);
const ball = world.body({ shape: 'circle', x: 300, y: 40, radius: 20, restitution: 0.7 });
world.run(); // steps on the shared ticker
```

## Exports

`physics` · `createWorld` · `World` · `Body` · `Constraint` · `collide` · `dragConstraint`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| bodies: circle, box, convex polygon (any winding, made convex) | ✅ yes | concave shapes: split them into convex parts |
| static, dynamic and kinematic bodies; density / mass, inertia, fixed rotation | ✅ yes |  |
| collisions: sort-and-sweep broad phase, SAT narrow phase, up to 2 contact points | ✅ yes | no continuous collision detection: very fast small bodies can tunnel |
| restitution, Coulomb friction, warm-started accumulated impulses | ✅ yes |  |
| constraints: distance (rigid or spring with stiffness / damping), pin, pointer drag | ✅ yes | no revolute motors / joint limits |
| sensors, collision categories / masks, collision events, sleeping | ✅ yes |  |
| fixed time step + accumulator (same result at any frame rate) | ✅ yes |  |
| SSR / workers | ✅ yes | pure maths; world.run() needs the runtime ticker |

## Components that need it

- `<usa-physics-playground>` — Physics playground
