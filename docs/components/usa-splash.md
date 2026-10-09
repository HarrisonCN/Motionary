# `<usa-splash>` — Splash screen

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

An app launch screen that leaves (fade, scale, slide-up, circle) once the page has loaded — never sooner than min ms.

- **Category:** page
- **Import:** `import { defineSplash } from 'motionary/components/page'` then `defineSplash();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** —
- **Events:** `usa:done`
- **Slots:** —
- **Methods:** `done()`
- **Source:** [src/components/page/splash.ts](../../src/components/page/splash.ts)

## Minimal example

```html
<usa-splash exit="circle" min="800">
  <img src="logo.svg" alt="">
</usa-splash>
```

## ES module

```js
import { defineSplash } from 'motionary/components/page';

defineSplash(); // registers <usa-splash>

/* then use it in your HTML:
<usa-splash exit="circle" min="800">
  <img src="logo.svg" alt="">
</usa-splash>
*/
```
