# `<mo-desktop-windows>` — Desktop windows

> Element name `<mo-desktop-windows>` (default since 17.3); the legacy name `<usa-desktop-windows>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Draggable, stackable windows with a dock; close pops toward the dock and back.

- **Category:** gesture · **since** 17.11
- **Import:** `import { defineDesktopWindows } from 'motionary/components/widgets'` then `defineDesktopWindows();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `height`, `label`, `close-label`
- **Events:** `usa:focus`, `usa:open`, `usa:close`, `usa:move`
- **Slots:** —
- **Methods:** `open()`, `close()`
- **Source:** [src/components/widgets/desktop-windows.ts](../../src/components/widgets/desktop-windows.ts)

## Minimal example

```html
<mo-desktop-windows height="320px"><div data-title="Notes">Hello</div><div data-title="Music">Playing</div></mo-desktop-windows>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineDesktopWindows } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDesktopWindows(); // registers <mo-desktop-windows>

/* then use it in your HTML:
<mo-desktop-windows height="320px"><div data-title="Notes">Hello</div><div data-title="Music">Playing</div></mo-desktop-windows>
*/
```
