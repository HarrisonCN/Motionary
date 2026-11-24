# `<mo-icon>` — Icon

> Element name `<mo-icon>` (default since 17.3); the legacy name `<usa-icon>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

One of 253 original line icons in the text colour, with twelve motions (spin, pulse, beat, bounce, wiggle, shake, ring, float, flip, draw, pop, blink) on loop, hover, click or view.

- **Category:** svg · **since** 17.14
- **Import:** `import { defineIcon } from 'motionary/components/widgets'` then `defineIcon();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `name`, `size`, `stroke`, `color`, `label`, `motion`, `trigger`, `duration`
- **Events:** `usa:play`
- **Slots:** —
- **Methods:** `play()`
- **Source:** [src/components/widgets/icon.ts](../../src/components/widgets/icon.ts)

## Minimal example

```html
<p style="display:flex;gap:18px;flex-wrap:wrap;font-size:28px;margin:0"><mo-icon name="bell" motion="ring" trigger="loop" size="32" label="Notifications"></mo-icon><mo-icon name="heart" motion="beat" trigger="loop" size="32" color="#e11d48"></mo-icon><mo-icon name="refresh" motion="spin" trigger="loop" size="32"></mo-icon><mo-icon name="sparkles" motion="pulse" trigger="loop" size="32" color="#a855f7"></mo-icon><mo-icon name="send" motion="float" trigger="loop" size="32"></mo-icon><mo-icon name="settings" motion="draw" trigger="loop" size="32"></mo-icon></p>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineIcon } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineIcon(); // registers <mo-icon>

/* then use it in your HTML:
<p style="display:flex;gap:18px;flex-wrap:wrap;font-size:28px;margin:0"><mo-icon name="bell" motion="ring" trigger="loop" size="32" label="Notifications"></mo-icon><mo-icon name="heart" motion="beat" trigger="loop" size="32" color="#e11d48"></mo-icon><mo-icon name="refresh" motion="spin" trigger="loop" size="32"></mo-icon><mo-icon name="sparkles" motion="pulse" trigger="loop" size="32" color="#a855f7"></mo-icon><mo-icon name="send" motion="float" trigger="loop" size="32"></mo-icon><mo-icon name="settings" motion="draw" trigger="loop" size="32"></mo-icon></p>
*/
```
