# `<mo-fling-ruler>` — Fling ruler

> Element name `<mo-fling-ruler>` (default since 17.3); the legacy name `<usa-fling-ruler>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A ruler you fling under a fixed needle to pick a value, as health apps pick a weight: it coasts with the flick's speed, stretches past the ends and snaps to the nearest step. Arrow keys and Page Up / Down too.

- **Category:** ui · **since** 17.20
- **Import:** `import { defineFlingRuler } from 'motionary/components/widgets'` then `defineFlingRuler();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `min`, `max`, `step`, `value`, `major`, `spacing`, `unit`, `label`, `disabled`, `feel`, `haptics`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/fling-ruler.ts](../../src/components/widgets/fling-ruler.ts)

## Minimal example

```html
<mo-fling-ruler min="30" max="150" step="0.5" value="62.5" unit="kg" label="Weight"></mo-fling-ruler>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineFlingRuler } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineFlingRuler(); // registers <mo-fling-ruler>

/* then use it in your HTML:
<mo-fling-ruler min="30" max="150" step="0.5" value="62.5" unit="kg" label="Weight"></mo-fling-ruler>
*/
```
