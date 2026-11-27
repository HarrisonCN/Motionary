# `<mo-fling-marquee>` — Fling marquee

> Element name `<mo-fling-marquee>` (default since 17.3); the legacy name `<usa-fling-marquee>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A marquee you can grab and fling: it keeps the flick's momentum, then eases back to its cruise speed with no seam. Slows under the pointer, with a pause button.

- **Category:** ui · **since** 17.19
- **Import:** `import { defineFlingMarquee } from 'motionary/components/widgets'` then `defineFlingMarquee();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `speed`, `gap`, `paused`, `label`, `haptics`
- **Events:** `usa:pause`
- **Slots:** —
- **Methods:** `fling()`
- **Source:** [src/components/widgets/fling-marquee.ts](../../src/components/widgets/fling-marquee.ts)

## Minimal example

```html
<mo-fling-marquee label="Partners"><span style="padding:10px 18px;border-radius:99px;background:#eef2ff">Aurora</span><span style="padding:10px 18px;border-radius:99px;background:#ecfdf5">Basil</span><span style="padding:10px 18px;border-radius:99px;background:#fff7ed">Cobalt</span><span style="padding:10px 18px;border-radius:99px;background:#fdf2f8">Dune</span></mo-fling-marquee>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFlingMarquee } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFlingMarquee(); // registers <mo-fling-marquee>

/* then use it in your HTML:
<mo-fling-marquee label="Partners"><span style="padding:10px 18px;border-radius:99px;background:#eef2ff">Aurora</span><span style="padding:10px 18px;border-radius:99px;background:#ecfdf5">Basil</span><span style="padding:10px 18px;border-radius:99px;background:#fff7ed">Cobalt</span><span style="padding:10px 18px;border-radius:99px;background:#fdf2f8">Dune</span></mo-fling-marquee>
*/
```
