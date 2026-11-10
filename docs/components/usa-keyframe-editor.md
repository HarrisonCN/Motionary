# `<mo-keyframe-editor>` — Animation editor 2.0

> Element name `<mo-keyframe-editor>` (default since 17.3); the legacy name `<usa-keyframe-editor>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.9: a compact timeline for <usa-player> JSON — drag a bar to move a track, drag its edge to resize, scrub the playhead or press play; exports format use-scroll-animate/animation v1.

- **Category:** timeline · **since** 6.9
- **Import:** `import { defineKeyframeEditor } from 'motionary/components/widgets'` then `defineKeyframeEditor();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `for`
- **Events:** `usa:change`
- **Slots:** —
- **Methods:** `toJSON()`, `play()`, `seek()`
- **Source:** [src/components/widgets/keyframe-editor.ts](../../src/components/widgets/keyframe-editor.ts)

## Minimal example

```html
<div id="hero"><h1>Title</h1><div class="card">…</div><button>Go</button></div>
<usa-keyframe-editor for="hero"></usa-keyframe-editor>
<script>
  const editor = document.querySelector('usa-keyframe-editor');
  editor.addEventListener('usa:change', (e) => save(e.detail.animation));
</script>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineKeyframeEditor } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineKeyframeEditor(); // registers <mo-keyframe-editor>

/* then use it in your HTML:
<div id="hero"><h1>Title</h1><div class="card">…</div><button>Go</button></div>
<mo-keyframe-editor for="hero"></mo-keyframe-editor>
*/
```
