# `<usa-voice-button>` — Voice button

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.8: a push-to-talk mic button — while listening a halo breathes and level bars wave; feed it live input levels with level (0–1) and they follow your voice.

- **Category:** ui · **since** 7.8
- **Import:** `import { defineVoiceButton } from 'motionary/components/widgets'` then `defineVoiceButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `bars`, `listening`
- **Events:** —
- **Slots:** —
- **Methods:** `toggle()`
- **Source:** [src/components/widgets/voice-button.ts](../../src/components/widgets/voice-button.ts)

## Minimal example

```html
<usa-voice-button label="Talk to the assistant"></usa-voice-button>
<script>vb.addEventListener('usa:start', start); analyser.onlevel = (l) => (vb.level = l);</script>
```

## ES module

```js
import { defineVoiceButton } from 'motionary/components/widgets';

defineVoiceButton(); // registers <usa-voice-button>

/* then use it in your HTML:
<usa-voice-button label="Talk to the assistant"></usa-voice-button>
*/
```
