# `<usa-message-list>` — Chat thread

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.4: a chat thread — new bubbles pop in from their side, consecutive messages group, the list sticks to the bottom (or shows a “↓ New messages” pill when you scrolled up) and typing(name) shows animated typing dots.

- **Category:** ui · **since** 7.4
- **Import:** `import { defineMessageList } from 'motionary/components/widgets'` then `defineMessageList();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** —
- **Events:** `usa:message`
- **Slots:** —
- **Methods:** `push()`, `typing()`
- **Source:** [src/components/widgets/message-list.ts](../../src/components/widgets/message-list.ts)

## Minimal example

```html
<usa-message-list>
  <p data-from="Ada">Hi! 👋</p>
  <p data-me>Hey Ada</p>
</usa-message-list>
<script>list.typing('Ada'); list.push({ from: 'Ada', text: 'Ship it?' });</script>
```

## ES module

```js
import { defineMessageList } from 'motionary/components/widgets';

defineMessageList(); // registers <usa-message-list>

/* then use it in your HTML:
<usa-message-list>
  <p data-from="Ada">Hi! 👋</p>
  <p data-me>Hey Ada</p>
</usa-message-list>
*/
```
