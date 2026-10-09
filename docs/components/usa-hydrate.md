# `<usa-hydrate>` — SSR hydration animation

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.0: server-rendered children animate in on hydration — hidden only while JS is on and not yet upgraded (ssrHead() in the head, 3 s CSS fallback), then staggered in on the unified clock.

- **Category:** ui · **since** 8.0
- **Import:** `import { defineHydrate } from 'motionary/components/widgets'` then `defineHydrate();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `effect`, `stagger`, `duration`
- **Events:** `usa:hydrated`
- **Slots:** —
- **Methods:** `replay()`
- **Source:** [src/components/widgets/hydrate.ts](../../src/components/widgets/hydrate.ts)

## Minimal example

```html
<!-- <head> -->${ssrHead()}
<usa-hydrate effect="fade-up" stagger="80">
  <h1>Server-rendered title</h1>
  <p>…</p>
</usa-hydrate>
<!-- or: <section data-usa-hydrate="blur">…</section> + hydrateMotion() -->
```

## ES module

```js
import { defineHydrate } from 'motionary/components/widgets';

defineHydrate(); // registers <usa-hydrate>

/* then use it in your HTML:
<!-- <head> -->${ssrHead()}
<usa-hydrate effect="fade-up" stagger="80">
  <h1>Server-rendered title</h1>
  <p>…</p>
</usa-hydrate>
<!-- or: <section data-usa-hydrate="blur">…</section> + hydrateMotion() -->
*/
```
