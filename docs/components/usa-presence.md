# `<mo-presence>` — Presence avatar

> Element name `<mo-presence>` (default since 17.3); the legacy name `<usa-presence>` is a deprecated alias that keeps working. With a single-component or category import call `defineMoAliases()` from `motionary/components/mo` first unless the component registers its `mo-*` name itself (17.3+ widgets).

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.4: an avatar with a live status dot (online, away, busy, offline) — coming online sends a ripple, speaking adds a pulsing ring and story an animated gradient ring. Initials when there is no photo.

- **Category:** ui · **since** 7.4
- **Import:** `import { definePresence } from 'motionary/components/widgets'` then `definePresence();`
- **CDN:** `<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>`
- **Attributes:** `status`, `speaking`, `name`, `src`
- **Events:** —
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/widgets/presence.ts](../../src/components/widgets/presence.ts)

## Minimal example

```html
<usa-presence name="Ada Lovelace" status="online"></usa-presence>
<usa-presence name="Alan Turing" status="away" speaking></usa-presence>
<usa-presence name="Grace Hopper" status="busy" story></usa-presence>
```

## ES module

```js
import { defineMoAliases } from 'motionary/components/mo';
import { definePresence } from 'motionary/components/widgets';

defineMoAliases(); // <mo-*> names (the usa-* names keep working)
definePresence(); // registers <mo-presence>

/* then use it in your HTML:
<mo-presence name="Ada Lovelace" status="online"></mo-presence>
<mo-presence name="Alan Turing" status="away" speaking></mo-presence>
<mo-presence name="Grace Hopper" status="busy" story></mo-presence>
*/
```
