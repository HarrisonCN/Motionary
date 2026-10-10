# Runtime tiers (11.4)

Every `motionary/runtime` module belongs to one of three tiers. A page pays only for the tiers it uses: an ordinary
site that needs scroll animations, text effects and keyframes stays in **basic** and never downloads WebGL, 3D file
parsing or physics.

| Tier | Modules | For |
|---|---|---|
| **basic** | `motionary/runtime` (ticker, tween, timeline), `scroll`, `text`, `format-css` (CSS / WAAPI keyframes), `format-motion` | scroll-linked scenes, text splitting, keyframes, tweens |
| **standard** | `smooth`, `drag-snap`, `format-svg`, `format-sprite`, `format-gif`, `format-apng`, `format-webp`, `vector` (Lottie / dotLottie), `lottie-state`; official runtime: Rive | smooth scrolling, gestures, SVG morphing, sprites and animated images, Lottie |
| **advanced** | `gl` (WebGL2), `format-gltf`, `format-obj`, `gltf-anim`, `gltf-decoders` (Draco / KTX2), `physics`, `format-scene`; official runtimes: Draco decoder, Basis transcoder | 3D scenes and models, GPU effects, physics |

A module only depends on modules of its own tier or below (checked by `test/widgets-11-4.test.ts`).

## Where the tier shows up

- **Code:** `import { RUNTIME_TIERS, tierOf, maxTier } from 'motionary/runtime'` — `tierOf('gl')` is `'advanced'`;
  `maxTier(['scroll', 'vector'])` is `'standard'`. Every module object carries `tier` (`gl.tier`).
- **Manifest** (`motionary/tooling/manifest.json`, schema v2 — optional property): `runtimeModules[].tier` and
  `components[].tier` (the highest tier among a component's prerequisites; `basic` when it needs none). The MCP server
  (`motionary-mcp`) serves the same manifest.
- **Store / gallery:** a tier badge next to the "Requires" badge; the prerequisites panel names the tier.
- **Docs:** each `docs/runtime/<module>.md` states its tier.

## Budgets by tier

`npm run check:tiers` (CI, after the build) bundles all modules of a tier — plus the tiers below — registered with
`use()`, and checks fixed gzip budgets:

| Tier bundle | Measured (11.3 build) | Budget |
|---|---|---|
| basic (core + 4 modules) | 10.84 KB | 12 KB |
| standard (basic + 9 modules) | 33.73 KB | 37 KB |
| advanced (everything, 21 modules) | 54.55 KB | 60 KB |

It also fails when the basic bundle contains a standard / advanced module, or the standard bundle an advanced one.
The per-module budgets in `size-budget.json` stay as they are. Budgets are not raised automatically.
