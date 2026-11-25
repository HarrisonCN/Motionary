# `<mo-spring-accordion>` — Spring accordion

> Element name `<mo-spring-accordion>` (default since 17.3); the legacy name `<usa-spring-accordion>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Panels open on a spring that reverses smoothly mid-way, the content drifts in after it and the chevron flips with an overshoot.

- **Category:** ui · **since** 17.17
- **Import:** `import { defineSpringAccordion } from 'motionary/components/widgets'` then `defineSpringAccordion();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `open`, `multiple`, `feel`, `haptics`
- **Events:** `usa:toggle`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/spring-accordion.ts](../../src/components/widgets/spring-accordion.ts)

## Minimal example

```html
<mo-spring-accordion open="0"><section data-title="What is a spring?"><p>A target and a velocity, nothing else.</p></section><section data-title="Reduced motion"><p>Values jump to their targets.</p></section></mo-spring-accordion>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringAccordion } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringAccordion(); // registers <mo-spring-accordion>

/* then use it in your HTML:
<mo-spring-accordion open="0"><section data-title="What is a spring?"><p>A target and a velocity, nothing else.</p></section><section data-title="Reduced motion"><p>Values jump to their targets.</p></section></mo-spring-accordion>
*/
```
