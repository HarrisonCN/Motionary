# `<usa-rive>` — Rive player (official runtime)

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

10.6: plays Rive (.riv) files — artboards, animations and state machines with inputs — through the official Rive runtime @rive-app/canvas, an optional peer dependency that is lazy-loaded on first use (Motionary does not reimplement the proprietary .riv format). Requires @rive-app/canvas — npm i @rive-app/canvas, or load its CDN script first; missing → a clear message in place.

- **Category:** ui · **since** 10.6 · **changed in** 10.7
- **Import:** `import { defineRive } from 'motionary/components/widgets'` then `defineRive();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `src`, `artboard`, `animation`, `state-machine`, `autoplay`, `fit`, `label`, `runtime-src`
- **Events:** `usa:load`, `usa:error`, `usa:runtime-missing`
- **Slots:** —
- **Methods:** `play()`, `pause()`, `input()`
- **Source:** [src/components/widgets/rive.ts](../../src/components/widgets/rive.ts)

## Prerequisites — Requires: @rive-app/canvas

1. **Install:** `npm i @rive-app/canvas`
2. **Import order & registration:** Install the official runtime next to motionary, then hand <usa-rive> a lazy loader with provideRiveRuntime(() => import('@rive-app/canvas')) before the element mounts — your bundler splits the runtime into its own chunk, fetched only when the first <usa-rive> appears. Without a bundler: load the official rive.js from a CDN before the component bundles (window.rive), use an import map, or set runtime-src on the element. Missing → a clear message in place + usa:runtime-missing.

```js
import { provideRiveRuntime } from 'motionary/components/widgets';
import { defineRive } from 'motionary/components/widgets';

provideRiveRuntime(() => import('@rive-app/canvas')); // lazy: fetched when the first <usa-rive> mounts
defineRive(); // registers <usa-rive> — after the prerequisites
```

3. **CDN:**

```html
<script src="https://unpkg.com/@rive-app/canvas@2.44.1/rive.js"></script>
<!-- then the component bundles -->
<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>
```

## Minimal example

```html
<usa-rive src="/anim/icon.riv" state-machine="State Machine 1" autoplay label="Icon"></usa-rive>
```

## ES module

```js
import { provideRiveRuntime } from 'motionary/components/widgets';

provideRiveRuntime(() => import('@rive-app/canvas')); // lazy: fetched when the first <usa-rive> mounts
import { defineRive } from 'motionary/components/widgets';

defineRive(); // registers <usa-rive>

/* then use it in your HTML:
<usa-rive src="/anim/icon.riv" state-machine="State Machine 1" autoplay label="Icon"></usa-rive>
*/
```
