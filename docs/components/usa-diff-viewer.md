# `<mo-diff-viewer>` — Diff viewer

> Element name `<mo-diff-viewer>` (default since 17.3); the legacy name `<usa-diff-viewer>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Two pre blocks compared line by line, unified or side by side, with changed characters marked.

- **Category:** layout · **since** 17.13
- **Import:** `import { defineDiffViewer } from 'motionary/components/widgets'` then `defineDiffViewer();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `mode`, `file`, `label`, `unified-label`, `split-label`, `added-label`, `removed-label`
- **Events:** `usa:mode`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/diff-viewer.ts](../../src/components/widgets/diff-viewer.ts)

## Minimal example

```html
<mo-diff-viewer file="greet.js"><pre data-before>function greet(name) {
  return "Hi " + name;
}</pre><pre data-after>function greet(name = "you") {
  return `Hello, ${name}!`;
}</pre></mo-diff-viewer>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineDiffViewer } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineDiffViewer(); // registers <mo-diff-viewer>

/* then use it in your HTML:
<mo-diff-viewer file="greet.js"><pre data-before>function greet(name) {
  return "Hi " + name;
}</pre><pre data-after>function greet(name = "you") {
  return `Hello, ${name}!`;
}</pre></mo-diff-viewer>
*/
```
