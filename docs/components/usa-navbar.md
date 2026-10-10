# `<usa-navbar>` — Auto-hide navbar

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Hides while you scroll down, slides back on the first scroll up; shrink makes it compact once scrolled. This page’s demo scrolls an inner box.

- **Category:** ui · **since** 2.6 · **changed in** 6.6, 12.0, 13.1
- **Import:** `import { defineNavbar } from 'motionary/components/ui'` then `defineNavbar();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `target`, `threshold`
- **Events:** `usa:hide`, `usa:show`
- **Slots:** —
- **Methods:** `show()`
- **Source:** [src/components/ui/navbar.ts](../../src/components/ui/navbar.ts)

## Minimal example

```html
<usa-navbar shrink>
  <header>…</header>
</usa-navbar>
```

## ES module

```js
import { defineNavbar } from 'motionary/components/ui';

defineNavbar(); // registers <usa-navbar>

/* then use it in your HTML:
<usa-navbar shrink>
  <header>…</header>
</usa-navbar>
*/
```
