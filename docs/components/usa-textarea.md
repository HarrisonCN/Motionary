# `<mo-textarea>` — Adaptive textarea

> Element name `<mo-textarea>` (default since 17.3); the legacy name `<usa-textarea>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Native multiline input, bounded auto-resize, character counter and reset.

- **Category:** ui · **since** 17.7
- **Import:** `import { defineTextarea } from 'motionary/components/widgets'` then `defineTextarea();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `value`, `name`, `placeholder`, `rows`, `max-rows`, `maxlength`, `required`, `disabled`, `readonly`, `auto-resize`
- **Events:** `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** `focusInput()`, `reset()`
- **Source:** [src/components/widgets/textarea.ts](../../src/components/widgets/textarea.ts)

## Minimal example

```html
<mo-textarea label="Creative brief" name="brief" value="Light, people, and the city between them." maxlength="280" auto-resize hint="A few words about your next project."></mo-textarea>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineTextarea } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineTextarea(); // registers <mo-textarea>

/* then use it in your HTML:
<mo-textarea label="Creative brief" name="brief" value="Light, people, and the city between them." maxlength="280" auto-resize hint="A few words about your next project."></mo-textarea>
*/
```
