# `<usa-audio>` — Beat-triggered effects

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

5.6: <usa-audio> renders a toggle (a user gesture starts Web Audio), detects beats and plays any registered effect on children with data-usa-beat="effect". JS: bindBeat(el, "pop"). Beats play nothing under reduced motion.

- **Category:** fx
- **Import:** `import { defineAudio } from 'motionary/components/effects'` then `defineAudio();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/components.umd.js"></script>`
- **Attributes:** `source`, `label`, `threshold`, `cooldown`
- **Events:** `usa:beat`, `usa:audio-error`
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/effects/audio.ts](../../src/components/effects/audio.ts)

## Minimal example

```html
<audio id="track" src="song.mp3" controls></audio>
<usa-audio source="#track" label="Play with visuals">
  <div data-usa-beat="pop">♪</div>
</usa-audio>
```

## ES module

```js
import { defineAudio } from 'motionary/components/effects';

defineAudio(); // registers <usa-audio>

/* then use it in your HTML:
<audio id="track" src="song.mp3" controls></audio>
<usa-audio source="#track" label="Play with visuals">
  <div data-usa-beat="pop">♪</div>
</usa-audio>
*/
```
