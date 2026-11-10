# `<mo-chat-composer>` — AI chat composer

> Element name `<mo-chat-composer>` (default since 17.3); the legacy name `<usa-chat-composer>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.8: an AI chat input that grows with its text; Enter sends, the send button pops when there is text and morphs into Stop while busy, with a thinking glow running round the composer.

- **Category:** ui · **since** 7.8
- **Import:** `import { defineChatComposer } from 'motionary/components/widgets'` then `defineChatComposer();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `placeholder`, `label`, `rows`, `busy`, `value`
- **Events:** `usa:stop`, `usa:send`
- **Slots:** —
- **Methods:** `send()`, `clear()`
- **Source:** [src/components/widgets/chat-composer.ts](../../src/components/widgets/chat-composer.ts)

## Minimal example

```html
<usa-chat-composer placeholder="Ask anything…"></usa-chat-composer>
<script>const composer = document.querySelector('usa-chat-composer'); composer.addEventListener('usa:send', async (e) => { composer.busy = true; await ask(e.detail.text); composer.busy = false; });</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineChatComposer } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineChatComposer(); // registers <mo-chat-composer>

/* then use it in your HTML:
<mo-chat-composer placeholder="Ask anything…"></mo-chat-composer>
*/
```
