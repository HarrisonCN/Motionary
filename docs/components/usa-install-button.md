# `<mo-install-button>` — Install button

> Element name `<mo-install-button>` (default since 17.3); the legacy name `<usa-install-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.1: one-click install snippet with npm / pnpm / yarn / bun / CDN tabs and a copy button that confirms with a check; `cdn` sets the URL of the CDN tab.

- **Category:** ui · **since** 10.1 · **changed in** 13.1
- **Import:** `import { defineInstallButton } from 'motionary/components/widgets'` then `defineInstallButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `package`, `managers`, `cdn`, `dev`, `manager`
- **Events:** `usa:copy`
- **Slots:** —
- **Methods:** `command()`, `copy()`
- **Source:** [src/components/widgets/install-button.ts](../../src/components/widgets/install-button.ts)

## Minimal example

```html
<usa-install-button package="motionary" managers="npm pnpm yarn bun cdn" cdn="https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime.iife.js"></usa-install-button>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineInstallButton } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineInstallButton(); // registers <mo-install-button>

/* then use it in your HTML:
<mo-install-button package="motionary" managers="npm pnpm yarn bun cdn" cdn="https://cdn.jsdelivr.net/npm/motionary@17/dist/runtime.iife.js"></mo-install-button>
*/
```
