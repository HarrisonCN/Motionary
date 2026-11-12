# `<mo-consent>` — Preference consent

> Element name `<mo-consent>` (default since 17.3); the legacy name `<usa-consent>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Explicit essential and optional choices; no cookies, storage or services are changed.

- **Category:** ui · **since** 17.7
- **Import:** `import { defineConsent } from 'motionary/components/widgets'` then `defineConsent();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `hint`, `analytics`, `marketing`, `disabled`, `name`
- **Events:** `usa:change`, `usa:consent`
- **Slots:** —
- **Methods:** `reset()`, `changed()`, `mount()`, `formReset()`
- **Source:** [src/components/widgets/consent.ts](../../src/components/widgets/consent.ts)

## Minimal example

```html
<mo-consent label="Your preferences"></mo-consent>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineConsent } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineConsent(); // registers <mo-consent>

/* then use it in your HTML:
<mo-consent label="Your preferences"></mo-consent>
*/
```
