# `<mo-micro-button>` — Micro button

> Element name `<mo-micro-button>` (default since 17.3); the legacy name `<usa-micro-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An action button that folds into a spinner while working, pops a tick on success or shakes on failure, then springs back.

- **Category:** ui · **since** 17.16
- **Import:** `import { defineMicroButton } from 'motionary/components/widgets'` then `defineMicroButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `loading-label`, `success-label`, `error-label`, `state`, `reset`, `variant`, `fx`, `disabled`, `feel`, `haptics`
- **Events:** `usa:state`, `usa:action`
- **Slots:** —
- **Methods:** `run()`, `setState()`
- **Source:** [src/components/widgets/micro-button.ts](../../src/components/widgets/micro-button.ts)

## Minimal example

```html
<mo-micro-button label="Save" success-label="Saved" error-label="Retry"></mo-micro-button>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMicroButton } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMicroButton(); // registers <mo-micro-button>

/* then use it in your HTML:
<mo-micro-button label="Save" success-label="Saved" error-label="Retry"></mo-micro-button>
*/
```
