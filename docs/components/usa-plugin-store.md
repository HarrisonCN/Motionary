# `<usa-plugin-store>` — Plugin marketplace

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.0: the plugin marketplace as a component — search the catalogue of effect packs, see each plugin’s effects and install it with one click (imports and registers the pack).

- **Category:** ui · **since** 9.0
- **Import:** `import { definePluginStore } from 'motionary/components/widgets'` then `definePluginStore();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `query`, `label`
- **Events:** `usa:install`, `usa:install-error`
- **Slots:** —
- **Methods:** `search()`, `install()`
- **Source:** [src/components/widgets/plugin-store.ts](../../src/components/widgets/plugin-store.ts)

## Minimal example

```html
<usa-plugin-store query="neon"></usa-plugin-store>
<script type="module">
  const store = document.querySelector('usa-plugin-store');
  store.loader = (entry) => import(entry); // or map to your bundler imports
</script>
```

## ES module

```js
import { definePluginStore } from 'motionary/components/widgets';

definePluginStore(); // registers <usa-plugin-store>

/* then use it in your HTML:
<usa-plugin-store query="neon"></usa-plugin-store>
*/
```
