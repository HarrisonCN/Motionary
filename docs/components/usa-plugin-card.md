# `<usa-plugin-card>` — Plugin detail card

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.1: a plugin’s name, version and author with a Motionary compatibility badge (semver `engine` range), a signature badge (SHA-256 integrity checked with Web Crypto), an animated download counter and expandable details. Requires motionary/runtime — npm i motionary, then use() before the card mounts.

- **Category:** ui · **since** 10.1
- **Import:** `import { definePluginCard } from 'motionary/components/widgets'` then `definePluginCard();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `name`, `title`, `version`, `author`, `engine`, `downloads`, `integrity`, `src`
- **Events:** `usa:toggle`, `usa:verified`, `usa:runtime-missing`
- **Slots:** —
- **Methods:** `toggle()`, `verify()`, `compat()`
- **Source:** [src/components/widgets/plugin-card.ts](../../src/components/widgets/plugin-card.ts)

## Prerequisites — Requires: motionary/runtime

1. **Install:** `npm i motionary`
2. **Import order & registration:** Import motionary/runtime and call use() once at start-up, before any runtime-powered component mounts. CDN: the IIFE registers itself (window.MotionaryRuntime).

```js
import { use } from 'motionary/runtime';
import { definePluginCard } from 'motionary/components/widgets';

use();
definePluginCard(); // registers <usa-plugin-card> — after the prerequisites
```

3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@10/dist/runtime.iife.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>
```

## Minimal example

```html
<usa-plugin-card name="retro" title="Retro" version="1.2.0" author="Motionary" engine="^10.0.0" downloads="12400">
  <p>Pixel, CRT, VHS and Y2K effects.</p>
</usa-plugin-card>
```

## ES module

```js
import { use } from 'motionary/runtime';

use();
import { definePluginCard } from 'motionary/components/widgets';

definePluginCard(); // registers <usa-plugin-card>

/* then use it in your HTML:
<usa-plugin-card name="retro" title="Retro" version="1.2.0" author="Motionary" engine="^10.0.0" downloads="12400">
  <p>Pixel, CRT, VHS and Y2K effects.</p>
</usa-plugin-card>
*/
```
