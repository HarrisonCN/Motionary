# `<mo-bounce-button>` — Bounce button

> Element name `<mo-bounce-button>` (default since 17.3); the legacy name `<usa-bounce-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An arrow that hops in its direction on press.

- **Category:** ui · **since** 17.9
- **Import:** `import { defineBounceButton } from 'motionary/components/widgets'` then `defineBounceButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `direction`, `disabled`
- **Events:** `usa:press`
- **Slots:** —
- **Methods:** `press()`
- **Source:** [src/components/widgets/bounce-button.ts](../../src/components/widgets/bounce-button.ts)

## Minimal example

```html
<mo-bounce-button label="Up"></mo-bounce-button> <mo-bounce-button label="Next" direction="right"></mo-bounce-button>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineBounceButton } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineBounceButton(); // registers <mo-bounce-button>

/* then use it in your HTML:
<mo-bounce-button label="Up"></mo-bounce-button> <mo-bounce-button label="Next" direction="right"></mo-bounce-button>
*/
```
