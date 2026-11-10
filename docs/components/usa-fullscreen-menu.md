# `<mo-fullscreen-menu>` — Full-screen menu (circle / curtain reveal)

> Element name `<mo-fullscreen-menu>` (default since 17.3); the legacy name `<usa-fullscreen-menu>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

17.3: a menu button opens a full-screen overlay that grows out of the button as a circle (or drops as a curtain), then the big links rise one by one; links with data-preview show a picture beside the list. Modal dialog: focus moves in and stays inside, Esc / the button closes and focus returns. Reduced motion: no reveal.

- **Category:** ui · **since** 17.3
- **Import:** `import { defineFullscreenMenu } from 'motionary/components/widgets'` then `defineFullscreenMenu();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `variant`
- **Events:** `usa:open`, `usa:close`
- **Slots:** —
- **Methods:** `show()`, `hide()`, `toggle()`
- **Source:** [src/components/widgets/fullscreen-menu.ts](../../src/components/widgets/fullscreen-menu.ts)

## Minimal example

```html
<mo-fullscreen-menu label="Menu" variant="circle">
  <a href="/" data-preview="/img/home.jpg">Home</a>
  <a href="/work" data-preview="/img/work.jpg">Work</a>
  <a href="/contact">Contact</a>
</mo-fullscreen-menu>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFullscreenMenu } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFullscreenMenu(); // registers <mo-fullscreen-menu>

/* then use it in your HTML:
<mo-fullscreen-menu label="Menu" variant="circle">
  <a href="/" data-preview="/img/home.jpg">Home</a>
  <a href="/work" data-preview="/img/work.jpg">Work</a>
  <a href="/contact">Contact</a>
</mo-fullscreen-menu>
*/
```
