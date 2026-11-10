# `<mo-modal>` — Modal dialog

> Element name `<mo-modal>` (default since 17.3); the legacy name `<usa-modal>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.3: native <dialog> (top layer, focus trap, Esc) with animated open / close and a blurred backdrop — scale, slide-up, flip, or origin: it grows out of the button that opened it. Focus returns to the opener.

- **Category:** transitions · **since** 6.3 · **changed in** 6.6, 13.0, 13.1, 13.3
- **Import:** `import { defineModal } from 'motionary/components/widgets'` then `defineModal();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `effect`, `label`, `persistent`
- **Events:** `usa:open`, `usa:close`
- **Slots:** —
- **Methods:** `show()`, `close()`, `toggle()`
- **Source:** [src/components/widgets/overlay.ts](../../src/components/widgets/overlay.ts)

## Minimal example

```html
<button data-usa-open="welcome">Open</button>
<usa-modal id="welcome" effect="origin" label="Welcome">
  <h2>Hello 👋</h2>
  <p>…</p>
  <button data-usa-close="ok">Got it</button>
</usa-modal>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineModal } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineModal(); // registers <mo-modal>

/* then use it in your HTML:
<button data-usa-open="welcome">Open</button>
<mo-modal id="welcome" effect="origin" label="Welcome">
  <h2>Hello 👋</h2>
  <p>…</p>
  <button data-usa-close="ok">Got it</button>
</mo-modal>
*/
```
