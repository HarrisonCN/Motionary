# `<mo-announcement-bar>` — Announcement bar

> Element name `<mo-announcement-bar>` (default since 17.3); the legacy name `<usa-announcement-bar>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

A slim bar that rolls between messages, pauses on hover or focus and can be dismissed.

- **Category:** ui · **since** 17.10
- **Import:** `import { defineAnnouncementBar } from 'motionary/components/widgets'` then `defineAnnouncementBar();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `interval`, `dismissible`, `label`, `close-label`, `tone`
- **Events:** `usa:change`, `usa:dismiss`
- **Slots:** —
- **Methods:** `dismiss()`, `next()`, `previous()`
- **Source:** [src/components/widgets/announcement-bar.ts](../../src/components/widgets/announcement-bar.ts)

## Minimal example

```html
<mo-announcement-bar dismissible><span>New: 21 components</span><a href="#">Read the changelog</a></mo-announcement-bar>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineAnnouncementBar } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
defineAnnouncementBar(); // registers <mo-announcement-bar>

/* then use it in your HTML:
<mo-announcement-bar dismissible><span>New: 21 components</span><a href="#">Read the changelog</a></mo-announcement-bar>
*/
```
