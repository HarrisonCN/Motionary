# `<mo-subscribe>` — Newsletter sign-up

> Element name `<mo-subscribe>` (default since 17.3); the legacy name `<usa-subscribe>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An email pill that shakes on a bad address and morphs its button into a drawn tick when done.

- **Category:** ui · **since** 17.11
- **Import:** `import { defineSubscribe } from 'motionary/components/widgets'` then `defineSubscribe();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `placeholder`, `button-label`, `success`, `invalid`
- **Events:** `usa:done`, `usa:error`, `usa:subscribe`
- **Slots:** —
- **Methods:** `done()`, `error()`, `reset()`
- **Source:** [src/components/widgets/subscribe.ts](../../src/components/widgets/subscribe.ts)

## Minimal example

```html
<mo-subscribe button-label="Subscribe"></mo-subscribe>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSubscribe } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSubscribe(); // registers <mo-subscribe>

/* then use it in your HTML:
<mo-subscribe button-label="Subscribe"></mo-subscribe>
*/
```
