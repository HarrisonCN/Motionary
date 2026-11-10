# `<mo-mega-menu>` — Mega menu (morphing panels)

> Element name `<mo-mega-menu>` (default since 17.3); the legacy name `<usa-mega-menu>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

17.3: a nav bar whose items open full-width mega panels on one shared surface that morphs its height from panel to panel. Hover intent, click / tap, ←/→ between triggers, ↓ into the panel, Esc back; disclosure pattern (aria-expanded) in a navigation landmark. Reduced motion: panels switch without the morph.

- **Category:** ui · **since** 17.3
- **Import:** `import { defineMegaMenu } from 'motionary/components/widgets'` then `defineMegaMenu();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `delay`, `close-delay`
- **Events:** `usa:open`, `usa:close`
- **Slots:** —
- **Methods:** `openItem()`, `close()`
- **Source:** [src/components/widgets/nav-panels.ts](../../src/components/widgets/nav-panels.ts)

## Minimal example

```html
<mo-mega-menu label="Main">
  <div><button>Products</button>
    <div data-panel>
      <section><h4>Build</h4><a href="/sdk">SDK</a><a href="/cli">CLI</a></section>
      <section><h4>Run</h4><a href="/edge">Edge</a></section>
    </div>
  </div>
  <div><button>Resources</button><div data-panel>…</div></div>
  <a href="/pricing">Pricing</a>
</mo-mega-menu>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMegaMenu } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMegaMenu(); // registers <mo-mega-menu>

/* then use it in your HTML:
<mo-mega-menu label="Main">
  <div><button>Products</button>
    <div data-panel>
      <section><h4>Build</h4><a href="/sdk">SDK</a><a href="/cli">CLI</a></section>
      <section><h4>Run</h4><a href="/edge">Edge</a></section>
    </div>
  </div>
  <div><button>Resources</button><div data-panel>…</div></div>
  <a href="/pricing">Pricing</a>
</mo-mega-menu>
*/
```
