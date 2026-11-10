# `<mo-message-list>` — Chat thread

> Element name `<mo-message-list>` (default since 17.3); the legacy name `<usa-message-list>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.4: a chat thread — new bubbles pop in from their side, consecutive messages group, the list sticks to the bottom (or shows a “↓ New messages” pill when you scrolled up) and typing(name) shows animated typing dots.

- **Category:** ui · **since** 7.4
- **Import:** `import { defineMessageList } from 'motionary/components/widgets'` then `defineMessageList();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`
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
<script>addEventListener('DOMContentLoaded', () => { const list = document.querySelector('usa-message-list'); list.typing('Ada'); list.push({ from: 'Ada', text: 'Ship it?' }); });</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineMessageList } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineMessageList(); // registers <mo-message-list>

/* then use it in your HTML:
<mo-message-list>
  <p data-from="Ada">Hi! 👋</p>
  <p data-me>Hey Ada</p>
</mo-message-list>
*/
```
