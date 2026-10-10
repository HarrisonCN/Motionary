# `<usa-spring>` — Spring effects

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

bounce-in, pop and drop entrances with true spring timing (CSS linear() easing), plus jelly and rubber-band attention effects on view, hover or click.

- **Category:** physics · **since** 2.3
- **Import:** `import { defineSpring } from 'motionary/components/physics'` then `defineSpring();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `effect`, `trigger`, `repeat`, `stiffness`, `damping`, `mass`, `preset`, `duration`, `delay`
- **Events:** `usa:complete`
- **Slots:** —
- **Methods:** `play()`, `reset()`
- **Source:** [src/components/physics/spring-effect.ts](../../src/components/physics/spring-effect.ts)

## Minimal example

```html
<usa-spring effect="bounce-in" preset="bouncy">
  <div class="card">Hello</div>
</usa-spring>
<usa-spring effect="jelly" trigger="click">
  <button>Tap me</button>
</usa-spring>
```

## ES module

```js
import { defineSpring } from 'motionary/components/physics';

defineSpring(); // registers <usa-spring>

/* then use it in your HTML:
<usa-spring effect="bounce-in" preset="bouncy">
  <div class="card">Hello</div>
</usa-spring>
<usa-spring effect="jelly" trigger="click">
  <button>Tap me</button>
</usa-spring>
*/
```
