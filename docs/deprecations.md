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
