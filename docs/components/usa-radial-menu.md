# `<mo-radial-menu>` — Radial menu

> Element name `<mo-radial-menu>` (default since 17.3); the legacy name `<usa-radial-menu>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A round button fans its own child buttons out on a circle; arrow keys go round, Escape closes.

- **Category:** click · **since** 17.15
- **Import:** `import { defineRadialMenu } from 'motionary/components/widgets'` then `defineRadialMenu();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `open`, `label`, `radius`, `start`, `spread`, `icon`
- **Events:** `usa:toggle`, `usa:select`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/radial-menu.ts](../../src/components/widgets/radial-menu.ts)

## Minimal example

```html
<mo-radial-menu label="Share" spread="180" start="-180" radius="76"><button aria-label="Copy link">🔗</button><button aria-label="Email">✉️</button><button aria-label="Message">💬</button><button aria-label="Save">⭐</button></mo-radial-menu>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRadialMenu } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRadialMenu(); // registers <mo-radial-menu>

/* then use it in your HTML:
<mo-radial-menu label="Share" spread="180" start="-180" radius="76"><button aria-label="Copy link">🔗</button><button aria-label="Email">✉️</button><button aria-label="Message">💬</button><button aria-label="Save">⭐</button></mo-radial-menu>
*/
```
