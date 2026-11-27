# `<mo-spring-pip>` — Spring PiP window

> Element name `<mo-spring-pip>` (default since 17.3); the legacy name `<usa-spring-pip>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A floating window you fling into a corner: it follows the finger, stretches past the frame's edges and its release speed picks the corner it settles in. Arrow keys move it too.

- **Category:** ui · **since** 17.19
- **Import:** `import { defineSpringPip } from 'motionary/components/widgets'` then `defineSpringPip();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `corner`, `inset`, `label`, `feel`, `haptics`
- **Events:** `usa:corner`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/spring-pip.ts](../../src/components/widgets/spring-pip.ts)

## Minimal example

```html
<mo-spring-pip corner="bottom-right" style="--usa-pip-height:240px"><p>Page behind the window</p><div data-pip style="padding:14px">Now playing · drag me</div></mo-spring-pip>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringPip } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringPip(); // registers <mo-spring-pip>

/* then use it in your HTML:
<mo-spring-pip corner="bottom-right" style="--usa-pip-height:240px"><p>Page behind the window</p><div data-pip style="padding:14px">Now playing · drag me</div></mo-spring-pip>
*/
```
