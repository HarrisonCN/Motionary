# `<mo-particle-button>` — Particle glass button

> Element name `<mo-particle-button>` (default since 17.3); the legacy name `<usa-particle-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An action or pressed toggle button with a particle burst. Real button keyboard activation; emits usa:activate.

- **Category:** ui · **since** 17.4
- **Import:** `import { defineParticleButton } from 'motionary/components/widgets'` then `defineParticleButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `icon`, `active-icon`, `toggle`, `pressed`, `disabled`, `theme`
- **Events:** `usa:activate`
- **Slots:** —
- **Methods:** `activate()`
- **Source:** [src/components/widgets/particle-button.ts](../../src/components/widgets/particle-button.ts)

## Minimal example

```html
<mo-particle-button label="Favorite" icon="spark" active-icon="heart" toggle></mo-particle-button>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineParticleButton } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineParticleButton(); // registers <mo-particle-button>

/* then use it in your HTML:
<mo-particle-button label="Favorite" icon="spark" active-icon="heart" toggle></mo-particle-button>
*/
```
