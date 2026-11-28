# `<mo-chat-head>` — Chat head

> Element name `<mo-chat-head>` (default since 17.3); the legacy name `<usa-chat-head>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A floating chat head you drag anywhere: let go and it is thrown to the nearer edge and docks with a spring. Drag it to the close target that rises and it is pulled in like a magnet and dismissed.

- **Category:** ui · **since** 17.20
- **Import:** `import { defineChatHead } from 'motionary/components/widgets'` then `defineChatHead();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `side`, `count`, `label`, `inset`, `feel`, `haptics`
- **Events:** `usa:dock`, `usa:dismiss`, `usa:restore`, `usa:tap`
- **Slots:** —
- **Methods:** `dismiss()`, `restore()`
- **Source:** [src/components/widgets/chat-head.ts](../../src/components/widgets/chat-head.ts)

## Minimal example

```html
<mo-chat-head count="3" label="Chat with Ada" style="--usa-chead-height:260px"><p style="padding:16px">The page behind the head. Drag the head around, or drop it on the × to dismiss it.</p><span data-head>AL</span></mo-chat-head>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineChatHead } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineChatHead(); // registers <mo-chat-head>

/* then use it in your HTML:
<mo-chat-head count="3" label="Chat with Ada" style="--usa-chead-height:260px"><p style="padding:16px">The page behind the head. Drag the head around, or drop it on the × to dismiss it.</p><span data-head>AL</span></mo-chat-head>
*/
```
