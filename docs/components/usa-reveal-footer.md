# `<mo-reveal-footer>` — Reveal footer

> Element name `<mo-reveal-footer>` (default since 17.3); the legacy name `<usa-reveal-footer>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A footer that is uncovered from beneath the page as it rises into view.

- **Category:** page · **since** 17.11
- **Import:** `import { defineRevealFooter } from 'motionary/components/widgets'` then `defineRevealFooter();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `shift`, `landmark`
- **Events:** `usa:reveal`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/reveal-footer.ts](../../src/components/widgets/reveal-footer.ts)

## Minimal example

```html
<mo-reveal-footer><p>© Motionary</p><a href="#">Back to top</a></mo-reveal-footer>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRevealFooter } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRevealFooter(); // registers <mo-reveal-footer>

/* then use it in your HTML:
<mo-reveal-footer><p>© Motionary</p><a href="#">Back to top</a></mo-reveal-footer>
*/
```
