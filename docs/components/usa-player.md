# `<usa-player>` — JSON animation player

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

5.9: <usa-player> plays a JSON animation — timeline presets, your own keyframes and any registered effect on a shared clock; play / pause / seek / rate / loop, scroll-scrubbing (trigger="scroll"). Export one from the Playground (<usa-player> JSON tab).

- **Category:** fx
- **Import:** `import { definePlayer } from 'motionary/components/effects'` then `definePlayer();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/components.umd.js"></script>`
- **Attributes:** `src`, `trigger`, `loop`, `rate`
- **Events:** —
- **Slots:** —
- **Methods:** `load()`, `play()`, `pause()`, `seek()`
- **Source:** [src/components/effects/player.ts](../../src/components/effects/player.ts)

## Minimal example

```html
<usa-player src="hero.json" trigger="view">
  <h1>Title</h1>
  <a class="cta">Start</a>
</usa-player>
```

## ES module

```js
import { definePlayer } from 'motionary/components/effects';

definePlayer(); // registers <usa-player>

/* then use it in your HTML:
<usa-player src="hero.json" trigger="view">
  <h1>Title</h1>
  <a class="cta">Start</a>
</usa-player>
*/
```
