# Deprecations (removed in 2.0)

Deprecated APIs keep working in 1.x. In development builds (`process.env.NODE_ENV !== 'production'`) the first use of a deprecated runtime API logs one `console.warn` prefixed with `[use-scroll-animate] Deprecated:`. Production builds and unbundled `<script>` usage never log.

| Deprecated (since 1.9) | Replacement | Warning |
|---|---|---|
| `import { createReactHooks } from 'use-scroll-animate'` | `import { createReactHooks } from 'use-scroll-animate/react'` | ✅ runtime (dev) |
| `import { createVueComposables } from 'use-scroll-animate'` | `import { createVueComposables } from 'use-scroll-animate/vue'` | ✅ runtime (dev) |
| `module` field and `dist/index.esm.js` | the `exports` map (`import` condition) | packaging only |
| per-file declarations in `dist/types/*` | bundled `dist/*.d.ts` / `*.d.mts` via `exports` | packaging only |
| `use-scroll-animate/dist/*` wildcard deep imports | the named entry points; `use-scroll-animate/umd` and `use-scroll-animate/element.umd` for the browser bundles | packaging only |

Behaviour changes planned for 2.0 (not deprecations, no warning):

- `engine` defaults to `'auto'` (native scroll-driven timeline where supported, JS elsewhere). Set `defaultEngine: 'js'` to keep the 1.x behaviour.
