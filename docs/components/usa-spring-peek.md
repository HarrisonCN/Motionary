# `<mo-spring-peek>` — Spring peek

> Element name `<mo-spring-peek>` (default since 17.3); the legacy name `<usa-spring-peek>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Press and hold a card to peek: it sinks, then a preview grows out of it over a blurred page. Pull it down to send it back; Enter opens it from the keyboard.

- **Category:** ui · **since** 17.19
- **Import:** `import { defineSpringPeek } from 'motionary/components/widgets'` then `defineSpringPeek();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `delay`, `label`, `close`, `feel`, `haptics`
- **Events:** `usa:toggle`, `usa:tap`
- **Slots:** —
- **Methods:** `show()`, `close()`
- **Source:** [src/components/widgets/spring-peek.ts](../../src/components/widgets/spring-peek.ts)

## Minimal example

```html
<mo-spring-peek label="Article preview"><strong>Spring physics, explained</strong><br><small>Hold to preview</small><div data-peek><h3>Spring physics, explained</h3><p>A spring has a target and a speed, never a fixed duration.</p></div></mo-spring-peek>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineSpringPeek } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineSpringPeek(); // registers <mo-spring-peek>

/* then use it in your HTML:
<mo-spring-peek label="Article preview"><strong>Spring physics, explained</strong><br><small>Hold to preview</small><div data-peek><h3>Spring physics, explained</h3><p>A spring has a target and a speed, never a fixed duration.</p></div></mo-spring-peek>
*/
```
