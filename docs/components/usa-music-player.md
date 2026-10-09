# `<usa-music-player>` — Music player

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.1: the cover spins like a record while playing, play morphs to pause, mini equalizer bars dance and the progress bar is a scrubbable slider. Plays a child <audio> or simulates a track.

- **Category:** ui · **since** 7.1
- **Import:** `import { defineMusicPlayer } from 'motionary/components/widgets'` then `defineMusicPlayer();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `title`, `artist`, `cover`, `src`
- **Events:** `usa:play`, `usa:pause`, `usa:seek`
- **Slots:** —
- **Methods:** `play()`, `pause()`, `toggle()`, `seek()`
- **Source:** [src/components/widgets/music-player.ts](../../src/components/widgets/music-player.ts)

## Minimal example

```html
<usa-music-player title="Night Drive" artist="Motionary" cover="cover.jpg">
  <audio src="track.mp3"></audio>
</usa-music-player>
```

## ES module

```js
import { defineMusicPlayer } from 'motionary/components/widgets';

defineMusicPlayer(); // registers <usa-music-player>

/* then use it in your HTML:
<usa-music-player title="Night Drive" artist="Motionary" cover="cover.jpg">
  <audio src="track.mp3"></audio>
</usa-music-player>
*/
```
