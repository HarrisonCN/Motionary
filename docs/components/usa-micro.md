# `<mo-micro>` — Micro

> Element name `<mo-micro>` (default since 17.3); the legacy name `<usa-micro>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Wraps anything with spring micro-interactions: press, hover, lift, magnetic, tilt, glow, squish, drag and focus, in any mix, plus feedback impulses.

- **Category:** interaction · **since** 17.16
- **Import:** `import { defineMicro } from 'motionary/components/widgets'` then `defineMicro();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `fx`, `feel`, `spring`, `haptics`, `disabled`, `press-scale`, `hover-scale`, `lift`, `strength`, `reach`, `tilt`, `bounds`, `snap`, `axis`, `feedback`
- **Events:** `usa:press`, `usa:release`, `usa:drag-end`
- **Slots:** —
- **Methods:** `feedback()`, `moveTo()`
- **Source:** [src/components/widgets/micro-wrap.ts](../../src/components/widgets/micro-wrap.ts)

## Minimal example

```html
<mo-micro fx="press lift glow" feel="bouncy"><button type="button" style="padding:14px 22px;border:0;border-radius:14px;background:#4f46e5;color:#fff;font:inherit">Press me</button></mo-micro>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMicro } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMicro(); // registers <mo-micro>

/* then use it in your HTML:
<mo-micro fx="press lift glow" feel="bouncy"><button type="button" style="padding:14px 22px;border:0;border-radius:14px;background:#4f46e5;color:#fff;font:inherit">Press me</button></mo-micro>
*/
```
