# `<usa-modal>` — Modal dialog

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.3: native <dialog> (top layer, focus trap, Esc) with animated open / close and a blurred backdrop — scale, slide-up, flip, or origin: it grows out of the button that opened it. Focus returns to the opener.

- **Category:** transitions · **since** 6.3
- **Import:** `import { defineModal } from 'motionary/components/widgets'` then `defineModal();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** —
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [undefined](../../undefined)

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
import { defineModal } from 'motionary/components/widgets';

defineModal(); // registers <usa-modal>

/* then use it in your HTML:
<button data-usa-open="welcome">Open</button>
<usa-modal id="welcome" effect="origin" label="Welcome">
  <h2>Hello 👋</h2>
  <p>…</p>
  <button data-usa-close="ok">Got it</button>
</usa-modal>
*/
```
