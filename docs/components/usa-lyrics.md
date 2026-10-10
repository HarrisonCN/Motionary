# `<usa-lyrics>` — Synced karaoke lyrics

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.1: LRC or [data-t] lines; the active line glows, scrolls to the centre and a highlight sweeps across it while past lines dim. Follows an <audio>, <video> or <usa-music-player> via for.

- **Category:** text · **since** 7.1
- **Import:** `import { defineLyrics } from 'motionary/components/widgets'` then `defineLyrics();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `for`
- **Events:** `usa:seek`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/lyrics.ts](../../src/components/widgets/lyrics.ts)

## Minimal example

```html
<usa-lyrics for="player">
  <script type="text/plain">
[00:01.00] First line
[00:04.50] Second line
  </script>
</usa-lyrics>
```

## ES module

```js
import { defineLyrics } from 'motionary/components/widgets';

defineLyrics(); // registers <usa-lyrics>

/* then use it in your HTML:
<usa-lyrics for="player">
  </usa-lyrics>
*/
```
