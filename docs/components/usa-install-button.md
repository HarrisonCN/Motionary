# `<usa-install-button>` — Install button

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.1: one-click install snippet with npm / pnpm / yarn / bun / CDN tabs and a copy button that confirms with a check; `cdn` sets the URL of the CDN tab.

- **Category:** ui · **since** 10.1
- **Import:** `import { defineInstallButton } from 'motionary/components/widgets'` then `defineInstallButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `package`, `managers`, `cdn`, `dev`, `manager`
- **Events:** `usa:copy`
- **Slots:** —
- **Methods:** `command()`, `copy()`
- **Source:** [src/components/widgets/install-button.ts](../../src/components/widgets/install-button.ts)

## Minimal example

```html
<usa-install-button package="motionary" managers="npm pnpm yarn bun cdn" cdn="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime.iife.js"></usa-install-button>
```

## ES module

```js
import { defineInstallButton } from 'motionary/components/widgets';

defineInstallButton(); // registers <usa-install-button>

/* then use it in your HTML:
<usa-install-button package="motionary" managers="npm pnpm yarn bun cdn" cdn="https://cdn.jsdelivr.net/npm/motionary@13/dist/runtime.iife.js"></usa-install-button>
*/
```
