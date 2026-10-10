# `<usa-presence>` — Presence avatar

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.4: an avatar with a live status dot (online, away, busy, offline) — coming online sends a ripple, speaking adds a pulsing ring and story an animated gradient ring. Initials when there is no photo.

- **Category:** ui · **since** 7.4
- **Import:** `import { definePresence } from 'motionary/components/widgets'` then `definePresence();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/widgets.umd.js"></script>`
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
import { definePresence } from 'motionary/components/widgets';

definePresence(); // registers <usa-presence>

/* then use it in your HTML:
<usa-presence name="Ada Lovelace" status="online"></usa-presence>
<usa-presence name="Alan Turing" status="away" speaking></usa-presence>
<usa-presence name="Grace Hopper" status="busy" story></usa-presence>
*/
```
