# `<usa-pull-refresh>` — Pull to refresh

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pull down at the top of a list: the spinner stretches in with rubber-band resistance; release past the threshold to refresh.

- **Category:** ui
- **Import:** `import { definePullRefresh } from 'motionary/components/ui'` then `definePullRefresh();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `threshold`, `disabled`, `label`
- **Events:** —
- **Slots:** —
- **Methods:** `refresh()`
- **Source:** [src/components/ui/pull-refresh.ts](../../src/components/ui/pull-refresh.ts)

## Minimal example

```html
<usa-pull-refresh style="height: 300px">
  <ul>…</ul>
</usa-pull-refresh>
<script>el.addEventListener('usa:refresh', async (e) => { await load(); e.detail.done(); });</script>
```

## ES module

```js
import { definePullRefresh } from 'motionary/components/ui';

definePullRefresh(); // registers <usa-pull-refresh>

/* then use it in your HTML:
<usa-pull-refresh style="height: 300px">
  <ul>…</ul>
</usa-pull-refresh>
*/
```
