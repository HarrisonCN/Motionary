# `<usa-hero-video>` — Hero video

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.4: a full-bleed hero with a background video — poster first, cross-fade to the video, a readable scrim, an always-there pause button and an optional scroll-scrubbed mode.

- **Category:** ui · **since** 9.4
- **Import:** `import { defineHeroVideo } from 'motionary/components/widgets'` then `defineHeroVideo();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `scrub`, `poster`
- **Events:** —
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/hero-video.ts](../../src/components/widgets/hero-video.ts)

## Minimal example

```html
<usa-hero-video label="Welcome" poster="poster.jpg">
  <video src="hero.mp4" autoplay muted loop playsinline></video>
  <h1>Motion, declared.</h1>
</usa-hero-video>
```

## ES module

```js
import { defineHeroVideo } from 'motionary/components/widgets';

defineHeroVideo(); // registers <usa-hero-video>

/* then use it in your HTML:
<usa-hero-video label="Welcome" poster="poster.jpg">
  <video src="hero.mp4" autoplay muted loop playsinline></video>
  <h1>Motion, declared.</h1>
</usa-hero-video>
*/
```
