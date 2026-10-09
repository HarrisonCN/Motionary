# `<usa-token-editor>` — Motion token editor (W3C DTCG)

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.6 (motion design tokens 2.0): edit duration and cubic-bézier easing tokens with a live preview per token, then export W3C Design Tokens (DTCG 2025.10 or the earlier draft) or import a DTCG file — aliases resolved, problems listed; apply writes the tokens to :root custom properties as you edit.

- **Category:** ui · **since** 10.6
- **Import:** `import { defineTokenEditor } from 'motionary/components/widgets'` then `defineTokenEditor();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `apply`, `format`, `groups`
- **Events:** `usa:export`, `usa:import`, `usa:change`
- **Slots:** —
- **Methods:** `exportJSON()`, `importJSON()`
- **Source:** [src/components/widgets/token-editor.ts](../../src/components/widgets/token-editor.ts)

## Minimal example

```html
<usa-token-editor apply format="2025.10"></usa-token-editor>
```

## ES module

```js
import { defineTokenEditor } from 'motionary/components/widgets';

defineTokenEditor(); // registers <usa-token-editor>

/* then use it in your HTML:
<usa-token-editor apply format="2025.10"></usa-token-editor>
*/
```
