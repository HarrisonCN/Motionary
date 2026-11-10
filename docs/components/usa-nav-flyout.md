# `<mo-nav-flyout>` — Nav flyouts (shared background)

> Element name `<mo-nav-flyout>` (default since 17.3); the legacy name `<usa-nav-flyout>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

17.3: dropdown flyouts anchored under each nav link; one background slides and resizes from flyout to flyout, so moving along the bar feels like one surface. Same keyboard and hover intent as the mega menu. Reduced motion: the background jumps.

- **Category:** ui · **since** 17.3
- **Import:** `import { defineNavFlyout } from 'motionary/components/widgets'` then `defineNavFlyout();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `delay`, `close-delay`
- **Events:** `usa:open`, `usa:close`
- **Slots:** —
- **Methods:** `openItem()`, `close()`
- **Source:** [src/components/widgets/nav-panels.ts](../../src/components/widgets/nav-panels.ts)

## Minimal example

```html
<mo-nav-flyout label="Main">
  <div><button>Docs</button><div data-panel><a href="/start">Getting started</a><a href="/api">API</a></div></div>
  <div><button>Company</button><div data-panel><a href="/about">About</a></div></div>
  <a href="/blog">Blog</a>
</mo-nav-flyout>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineNavFlyout } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineNavFlyout(); // registers <mo-nav-flyout>

/* then use it in your HTML:
<mo-nav-flyout label="Main">
  <div><button>Docs</button><div data-panel><a href="/start">Getting started</a><a href="/api">API</a></div></div>
  <div><button>Company</button><div data-panel><a href="/about">About</a></div></div>
  <a href="/blog">Blog</a>
</mo-nav-flyout>
*/
```
