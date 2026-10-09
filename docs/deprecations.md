# Deprecations

## Deprecated in 8.9, removed in 9.0

See [upgrading-9.md](./upgrading-9.md) — the 5.8 motion-theme names `applyTheme()`, `THEMES`, `THEME_NAMES`, `<usa-theme>` / `defineTheme()` (use `applyMotionTheme()`, `MOTION_THEMES`, `MOTION_THEME_NAMES`, `<usa-motion-theme>` / `defineMotionTheme()`; same behaviour). Run `npx usa-codemod-9 --write src`.

## Deprecated in 7.9, removed in 8.0 (released)

See [upgrading-8.md](./upgrading-8.md) — `<usa-rating>` / `defineRating()` (use `<usa-star-rating>` / `defineStarRating()`; same `value`, `max`, `readonly`, `label`, `name`; `icon="♥"` → `icon="heart"`). Run `npx usa-codemod-8 --write src`.

## Deprecated in 6.9, removed in 7.0

See [upgrading-7.md](./upgrading-7.md) — `registerFx2()` / `FX2_PACKS` (use `registerEffectPacks()` / `EFFECT_PACKS`), the 6.x pack registrars `registerGpuEffects`, `registerTextEffects3`, `registerLightEffects`, `register3dEffects`, `registerMorphEffects2`, `registerTransitionEffects2`, `registerWeatherEffects`, `registerPhysicsEffects2` (use the `register*Pack()` names), `<usa-tooltip>` (use `<usa-tip>`) and `<usa-toggle>` (use `<usa-switch>`). Run `npx usa-codemod-7 --write src`.

## Deprecated in 5.9, removed in 6.0

See [upgrading-6.md](./upgrading-6.md) — `burst()`, `confetti()`, `shake()` (use `playEffect(el, 'burst' | 'confetti' | 'shake', …)`), `<usa-cursor mode="trail">` (use the `comet-trail` effect). Run `npx usa-codemod-6 --write src`.

## Deprecated in 4.9, removed in 5.0

See [upgrading-5.md](./upgrading-5.md) — `motionIntensity: 'off'` / `setMotionIntensity('off')`, `reducedMotion: 'no-preference'`, `<usa-timeline scrub="js">`, shared names re-exported from category entries. Run `npx usa-codemod-5 --write src`.

# Upgrading to 2.0 (removed APIs)

Everything below was deprecated in 1.9 and is **removed in 2.0.0**. The full step-by-step list is the MIGRATION section of the [CHANGELOG](../CHANGELOG.md).

| Removed in 2.0 | Use instead |
|---|---|
| `import { createReactHooks } from 'use-scroll-animate'` | `import { createReactHooks } from 'use-scroll-animate/react'` |
| `import { createVueComposables } from 'use-scroll-animate'` | `import { createVueComposables } from 'use-scroll-animate/vue'` |
| `module` field, `dist/index.esm.js`, `dist/index.mjs` | the `exports` map: `import` → `dist/index.js` (ESM) |
| `dist/index.js` as CommonJS | `require('use-scroll-animate')` → `dist/index.cjs` (`main`) |
| per-file declarations in `dist/types/*`, `dist/*.d.mts` | bundled `dist/*.d.ts` (ESM) / `dist/*.d.cts` (CJS), resolved through `exports` |
| `use-scroll-animate/dist/*` deep imports | the named entry points (`use-scroll-animate`, `/react`, `/vue`, `/svelte`, `/solid`, `/element`) |

Unchanged: the browser bundles at `dist/index.umd.js` (global `ScrollAnimate`) and `dist/element.umd.js` keep their CDN URLs (`https://unpkg.com/use-scroll-animate/dist/index.umd.js`).

Behaviour changes in 2.0 (no API removed):

- `engine` defaults to `'auto'`: the native scroll-driven timeline is used where `animation-timeline: view()` is supported, unless the element sets `duration`, `delay`, `offset` or `stagger` itself. `createScrollAnimate({ defaultEngine: 'js' })` (or `ScrollAnimate.configure({ defaultEngine: 'js' })`) restores the 1.x behaviour.
- Output targets ES2020 (optional chaining / nullish coalescing are no longer down-levelled). Every browser with `Animation.commitStyles()` — which the library already relied on — supports ES2020.
- Node ≥ 18 is declared in `engines` (only relevant for SSR imports).
