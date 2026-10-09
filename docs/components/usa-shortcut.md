# `<usa-shortcut>` — Shortcut hint

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.9: keyboard-shortcut hints as keycaps (⌘ on Apple, Ctrl elsewhere); press the combination anywhere and the caps press down one after another and usa:trigger fires.

- **Category:** ui · **since** 7.9
- **Import:** `import { defineShortcut } from 'motionary/components/widgets'` then `defineShortcut();`
- **CDN:** `<script src="https://unpkg.com/motionary@11/dist/widgets.umd.js"></script>`
- **Attributes:** `keys`, `label`, `listen`, `for`
- **Events:** `usa:trigger`
- **Slots:** —
- **Methods:** `press()`
- **Source:** [src/components/widgets/shortcut.ts](../../src/components/widgets/shortcut.ts)

## Minimal example

```html
<usa-shortcut keys="mod+k" label="Search"></usa-shortcut>
<usa-shortcut keys="mod+shift+p" for="palette-button"></usa-shortcut>
```

## ES module

```js
import { defineShortcut } from 'motionary/components/widgets';

defineShortcut(); // registers <usa-shortcut>

/* then use it in your HTML:
<usa-shortcut keys="mod+k" label="Search"></usa-shortcut>
<usa-shortcut keys="mod+shift+p" for="palette-button"></usa-shortcut>
*/
```
