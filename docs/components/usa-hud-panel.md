# `<usa-hud-panel>` — HUD panel

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

8.4: a sci-fi HUD panel — angled corners, a glowing frame that draws itself in when the panel scrolls into view, a header with a blinking status light, and data rows that fill in as animated bar readouts.

- **Category:** ui · **since** 8.4 · **changed in** 8.9
- **Import:** `import { defineHudPanel } from 'motionary/components/widgets'` then `defineHudPanel();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `title`, `status`, `color`
- **Events:** `usa:boot`
- **Slots:** —
- **Methods:** `boot()`
- **Source:** [src/components/widgets/hud-panel.ts](../../src/components/widgets/hud-panel.ts)

## Minimal example

```html
<usa-hud-panel title="SHIP STATUS" status="ONLINE">
  <p data-value="82">Shields</p>
  <p data-value="47">Fuel</p>
</usa-hud-panel>
```

## ES module

```js
import { defineHudPanel } from 'motionary/components/widgets';

defineHudPanel(); // registers <usa-hud-panel>

/* then use it in your HTML:
<usa-hud-panel title="SHIP STATUS" status="ONLINE">
  <p data-value="82">Shields</p>
  <p data-value="47">Fuel</p>
</usa-hud-panel>
*/
```
