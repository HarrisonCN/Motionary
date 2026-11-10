# `<mo-field>` — Animated field

> Element name `<mo-field>` (default since 17.3); the legacy name `<usa-field>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.7: a text input whose label floats up on focus, with a growing underline; validates on blur — invalid shakes and slides the message in, valid draws a check. strength adds a 4-step password meter.

- **Category:** ui · **since** 7.7
- **Import:** `import { defineField } from 'motionary/components/widgets'` then `defineField();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `error`, `strength`
- **Events:** `usa:invalid`, `usa:valid`
- **Slots:** —
- **Methods:** `validate()`
- **Source:** [src/components/widgets/field.ts](../../src/components/widgets/field.ts)

## Minimal example

```html
<usa-field label="Email" type="email" name="email" required></usa-field>
<usa-field label="Password" type="password" name="pw" minlength="8" strength></usa-field>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineField } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineField(); // registers <mo-field>

/* then use it in your HTML:
<mo-field label="Email" type="email" name="email" required></mo-field>
<mo-field label="Password" type="password" name="pw" minlength="8" strength></mo-field>
*/
```
