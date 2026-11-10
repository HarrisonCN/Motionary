# `<mo-red-envelope>` — Red envelope (红包)

> Element name `<mo-red-envelope>` (default since 17.3); the legacy name `<usa-red-envelope>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.1: a Lunar New Year red envelope — tap and the flap swings open, the card slides out with the amount counting up and gold coins pop out.

- **Category:** ui · **since** 8.1
- **Import:** `import { defineRedEnvelope } from 'motionary/components/widgets'` then `defineRedEnvelope();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `amount`, `currency`, `message`, `from`, `opened`
- **Events:** `usa:open`
- **Slots:** —
- **Methods:** `open()`, `close()`
- **Source:** [src/components/widgets/red-envelope.ts](../../src/components/widgets/red-envelope.ts)

## Minimal example

```html
<usa-red-envelope amount="88.88" from="Grandma" message="恭喜发财"></usa-red-envelope>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineRedEnvelope } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineRedEnvelope(); // registers <mo-red-envelope>

/* then use it in your HTML:
<mo-red-envelope amount="88.88" from="Grandma" message="恭喜发财"></mo-red-envelope>
*/
```
