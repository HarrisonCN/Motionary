# `<mo-share-button>` — Share button

> Element name `<mo-share-button>` (default since 17.3); the legacy name `<usa-share-button>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A share button that fans out copy link, X, LinkedIn and email on a spring; uses the system share sheet with native.

- **Category:** click · **since** 17.12
- **Import:** `import { defineShareButton } from 'motionary/components/widgets'` then `defineShareButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `url`, `share-title`, `targets`, `label`, `copied-label`, `native`
- **Events:** `usa:share`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/share-button.ts](../../src/components/widgets/share-button.ts)

## Minimal example

```html
<mo-share-button url="https://example.com/post" share-title="A post"></mo-share-button>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineShareButton } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineShareButton(); // registers <mo-share-button>

/* then use it in your HTML:
<mo-share-button url="https://example.com/post" share-title="A post"></mo-share-button>
*/
```
