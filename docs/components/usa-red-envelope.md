# `<usa-red-envelope>` — Red envelope (红包)

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.1: a Lunar New Year red envelope — tap and the flap swings open, the card slides out with the amount counting up and gold coins pop out.

- **Category:** ui · **since** 8.1
- **Import:** `import { defineRedEnvelope } from 'motionary/components/widgets'` then `defineRedEnvelope();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `amount`, `currency`, `message`, `from`
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
import { defineRedEnvelope } from 'motionary/components/widgets';

defineRedEnvelope(); // registers <usa-red-envelope>

/* then use it in your HTML:
<usa-red-envelope amount="88.88" from="Grandma" message="恭喜发财"></usa-red-envelope>
*/
```
