# `<mo-route-transition>` — Route transition container

> Element name `<mo-route-transition>` (default since 17.3); the legacy name `<usa-route-transition>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.3: View Transitions 2.0 — link clicks swap the container’s content with the target page (fetched) or an inline <template data-route>, animated with the View Transitions API (Web Animations fallback); data-shared elements morph between routes; cross-document enables native MPA transitions.

- **Category:** transitions · **since** 10.3
- **Import:** `import { defineRouteTransition } from 'motionary/components/widgets'` then `defineRouteTransition();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `effect`, `engine`, `cross-document`, `current`, `links`, `history`, `selector`
- **Events:** `usa:navigate`, `usa:navigated`
- **Slots:** —
- **Methods:** `navigate()`
- **Source:** [src/components/widgets/route-transition.ts](../../src/components/widgets/route-transition.ts)

## Minimal example

```html
<usa-route-transition id="app" effect="slide" cross-document>
  <nav><a href="/">Home</a> <a href="/about">About</a></nav>
  <h1 data-shared="title">Home</h1>
</usa-route-transition>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRouteTransition } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRouteTransition(); // registers <mo-route-transition>

/* then use it in your HTML:
<mo-route-transition id="app" effect="slide" cross-document>
  <nav><a href="/">Home</a> <a href="/about">About</a></nav>
  <h1 data-shared="title">Home</h1>
</mo-route-transition>
*/
```
