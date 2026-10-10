# `<usa-upload-progress>` — Upload progress

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.7: a file row whose bar eases to value with a running shine; at 100 it turns into a check that draws itself, on error it shakes and offers Retry.

- **Category:** ui · **since** 7.7
- **Import:** `import { defineUploadProgress } from 'motionary/components/widgets'` then `defineUploadProgress();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
- **Attributes:** `name`, `size`, `value`, `status`, `message`
- **Events:** `usa:retry`, `usa:done`, `usa:error`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/upload-progress.ts](../../src/components/widgets/upload-progress.ts)

## Minimal example

```html
<usa-upload-progress name="report.pdf" size="2400000" value="40"></usa-upload-progress>
<script>row.value = 75; row.status = 'error';</script>
```

## ES module

```js
import { defineUploadProgress } from 'motionary/components/widgets';

defineUploadProgress(); // registers <usa-upload-progress>

/* then use it in your HTML:
<usa-upload-progress name="report.pdf" size="2400000" value="40"></usa-upload-progress>
*/
```
