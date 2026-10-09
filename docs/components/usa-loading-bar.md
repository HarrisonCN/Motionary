# `<usa-loading-bar>` — Top loading bar

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A slim NProgress-style bar for route changes and fetches: loadingBar.start() trickles, done() completes and fades.

- **Category:** page
- **Import:** `import { defineLoadingBar } from 'motionary/components/page'` then `defineLoadingBar();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** —
- **Slots:** —
- **Methods:** `start()`, `set()`, `done()`
- **Source:** [src/components/page/loading-bar.ts](../../src/components/page/loading-bar.ts)

## Minimal example

```html
<script type="module">
  import { loadingBar } from 'motionary/components/page';
  await loadingBar.track(fetch('/api'));
</script>
```

## ES module

```js
import { defineLoadingBar } from 'motionary/components/page';

defineLoadingBar(); // registers <usa-loading-bar>

/* then use it in your HTML:

*/
```
