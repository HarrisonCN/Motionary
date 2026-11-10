# `<mo-loading-bar>` — Top loading bar

> Element name `<mo-loading-bar>` (default since 17.3); the legacy name `<usa-loading-bar>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A slim NProgress-style bar for route changes and fetches: loadingBar.start() trickles, done() completes and fades.

- **Category:** page · **since** 2.7
- **Import:** `import { defineLoadingBar } from 'motionary/components/page'` then `defineLoadingBar();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>`
- **Attributes:** `label`, `color`, `height`
- **Events:** —
- **Slots:** —
- **Methods:** `start()`, `set()`, `done()`
- **Source:** [src/components/page/loading-bar.ts](../../src/components/page/loading-bar.ts)

## Minimal example

```html
<script type="module">
  import { loadingBar } from 'motionary/components/page';
  await loadingBar.track(new Promise((done) => setTimeout(done, 400))); // any promise, e.g. fetch('/api')
</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineLoadingBar } from 'motionary/components/page';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineLoadingBar(); // registers <mo-loading-bar>

/* then use it in your HTML:

*/
```
