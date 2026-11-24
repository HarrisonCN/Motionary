# `<mo-image-trail>` — Image trail

> Element name `<mo-image-trail>` (default since 17.3); the legacy name `<usa-image-trail>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Pictures drop behind the pointer as it moves across the area and fade away.

- **Category:** gesture · **since** 17.10
- **Import:** `import { defineImageTrail } from 'motionary/components/widgets'` then `defineImageTrail();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `distance`, `life`, `max`, `size`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/image-trail.ts](../../src/components/widgets/image-trail.ts)

## Minimal example

```html
<mo-image-trail><img src="assets/demo-photo.jpg" alt="Photo 1" data-full="assets/demo-photo.jpg"><img src="assets/demo-photo.jpg" alt="Photo 2" data-full="assets/demo-photo.jpg"><img src="assets/demo-photo.jpg" alt="Photo 3" data-full="assets/demo-photo.jpg"><h2>Move here</h2></mo-image-trail>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineImageTrail } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineImageTrail(); // registers <mo-image-trail>

/* then use it in your HTML:
<mo-image-trail><img src="assets/demo-photo.jpg" alt="Photo 1" data-full="assets/demo-photo.jpg"><img src="assets/demo-photo.jpg" alt="Photo 2" data-full="assets/demo-photo.jpg"><img src="assets/demo-photo.jpg" alt="Photo 3" data-full="assets/demo-photo.jpg"><h2>Move here</h2></mo-image-trail>
*/
```
