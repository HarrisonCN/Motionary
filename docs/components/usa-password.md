# `<mo-password>` — Private password field

> Element name `<mo-password>` (default since 17.3); the legacy name `<usa-password>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Reveal and hide without losing the selection; no secret values in custom events.

- **Category:** ui · **since** 17.7
- **Import:** `import { definePassword } from 'motionary/components/widgets'` then `definePassword();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `value`, `name`, `disabled`, `required`, `minlength`, `maxlength`, `autocomplete`, `placeholder`, `revealed`
- **Events:** `usa:action`, `usa:input`, `usa:change`
- **Slots:** —
- **Methods:** `reset()`, `changed()`, `mount()`, `formReset()`
- **Source:** [src/components/widgets/password.ts](../../src/components/widgets/password.ts)

## Minimal example

```html
<mo-password label="Password" name="password" minlength="8" hint="Use a unique password."></mo-password>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePassword } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePassword(); // registers <mo-password>

/* then use it in your HTML:
<mo-password label="Password" name="password" minlength="8" hint="Use a unique password."></mo-password>
*/
```
