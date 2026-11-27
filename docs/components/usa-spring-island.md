# `<mo-spring-island>` — Spring island

> Element name `<mo-spring-island>` (default since 17.3); the legacy name `<usa-spring-island>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A pill that morphs into a card and back on one spring: size and corners overshoot together while the faces cross-fade. pulse() plays a notification squash.

- **Category:** ui · **since** 17.19
- **Import:** `import { defineSpringIsland } from 'motionary/components/widgets'` then `defineSpringIsland();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `expanded`, `label`, `close`, `feel`, `haptics`
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** `expand()`, `collapse()`, `toggle()`, `pulse()`
- **Source:** [src/components/widgets/spring-island.ts](../../src/components/widgets/spring-island.ts)

## Minimal example

```html
<mo-spring-island><span data-compact>● Recording 02:14</span><h3>Voice memo</h3><p>Tap outside or press Escape to fold it back.</p></mo-spring-island>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringIsland } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringIsland(); // registers <mo-spring-island>

/* then use it in your HTML:
<mo-spring-island><span data-compact>● Recording 02:14</span><h3>Voice memo</h3><p>Tap outside or press Escape to fold it back.</p></mo-spring-island>
*/
```
