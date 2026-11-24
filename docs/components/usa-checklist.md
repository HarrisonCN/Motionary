# `<mo-checklist>` — Onboarding checklist

> Element name `<mo-checklist>` (default since 17.3); the legacy name `<usa-checklist>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Real checkboxes with a progress ring; the ring pops and the heading changes when every task is done.

- **Category:** ui · **since** 17.12
- **Import:** `import { defineChecklist } from 'motionary/components/widgets'` then `defineChecklist();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `done-label`
- **Events:** `usa:change`, `usa:complete`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/checklist.ts](../../src/components/widgets/checklist.ts)

## Minimal example

```html
<mo-checklist label="Get started"><span>Create a project</span><span>Invite a teammate</span><span>Publish</span></mo-checklist>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineChecklist } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineChecklist(); // registers <mo-checklist>

/* then use it in your HTML:
<mo-checklist label="Get started"><span>Create a project</span><span>Invite a teammate</span><span>Publish</span></mo-checklist>
*/
```
