# `<usa-chat-composer>` — AI chat composer

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.8: an AI chat input that grows with its text; Enter sends, the send button pops when there is text and morphs into Stop while busy, with a thinking glow running round the composer.

- **Category:** ui · **since** 7.8
- **Import:** `import { defineChatComposer } from 'motionary/components/widgets'` then `defineChatComposer();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `placeholder`, `label`, `rows`, `busy`
- **Events:** `usa:stop`, `usa:send`
- **Slots:** —
- **Methods:** `send()`, `clear()`
- **Source:** [src/components/widgets/chat-composer.ts](../../src/components/widgets/chat-composer.ts)

## Minimal example

```html
<usa-chat-composer placeholder="Ask anything…"></usa-chat-composer>
<script>composer.addEventListener('usa:send', async (e) => { composer.busy = true; await ask(e.detail.text); composer.busy = false; });</script>
```

## ES module

```js
import { defineChatComposer } from 'motionary/components/widgets';

defineChatComposer(); // registers <usa-chat-composer>

/* then use it in your HTML:
<usa-chat-composer placeholder="Ask anything…"></usa-chat-composer>
*/
```
