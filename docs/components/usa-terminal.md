# `<usa-terminal>` — Terminal window

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.2: a retro terminal window that types its commands after the prompt with a blinking block cursor and prints the output line by line when it scrolls into view — dark, green-phosphor or amber.

- **Category:** ui · **since** 8.2
- **Import:** `import { defineTerminal } from 'motionary/components/widgets'` then `defineTerminal();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `title`, `prompt`, `theme`, `speed`, `loop`
- **Events:** `usa:done`
- **Slots:** —
- **Methods:** `replay()`, `skip()`
- **Source:** [src/components/widgets/terminal.ts](../../src/components/widgets/terminal.ts)

## Minimal example

```html
<usa-terminal title="zsh" theme="green">
  <p data-cmd>npm i motionary</p>
  <p>added 1 package in 2s</p>
</usa-terminal>
```

## ES module

```js
import { defineTerminal } from 'motionary/components/widgets';

defineTerminal(); // registers <usa-terminal>

/* then use it in your HTML:
<usa-terminal title="zsh" theme="green">
  <p data-cmd>npm i motionary</p>
  <p>added 1 package in 2s</p>
</usa-terminal>
*/
```
