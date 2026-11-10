# `<mo-native-preview>` — Native preview

> Element name `<mo-native-preview>` (default since 17.3); the legacy name `<usa-native-preview>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

9.8: preview web motion as it will feel on a phone — an iOS / Android device frame replays the entrance with the rule’s curve and presses with a spring — and copy the generated React Native and Flutter code.

- **Category:** ui · **since** 9.8 · **changed in** 13.1
- **Import:** `import { defineNativePreview } from 'motionary/components/widgets'` then `defineNativePreview();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `rules`, `platform`, `name`
- **Events:** `usa:replay`
- **Slots:** —
- **Methods:** `replay()`, `code()`
- **Source:** [src/components/widgets/native-preview.ts](../../src/components/widgets/native-preview.ts)

## Minimal example

```html
<usa-native-preview platform="ios" rules="enter: fade-up 500ms smooth stagger 80ms; click: pop">
  <div class="row">Inbox</div><div class="row">Starred</div>
</usa-native-preview>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineNativePreview } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineNativePreview(); // registers <mo-native-preview>

/* then use it in your HTML:
<mo-native-preview platform="ios" rules="enter: fade-up 500ms smooth stagger 80ms; click: pop">
  <div class="row">Inbox</div><div class="row">Starred</div>
</mo-native-preview>
*/
```
