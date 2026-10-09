# `<usa-xp-bar>` — XP bar

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.5: an experience bar — add(n) fills it smoothly; overflowing fills to the end, the level badge pops and the bar restarts with the remainder (several levels if needed).

- **Category:** ui · **since** 7.5
- **Import:** `import { defineXpBar } from 'motionary/components/widgets'` then `defineXpBar();`
- **CDN:** `<script src="https://unpkg.com/motionary@10/dist/widgets.umd.js"></script>`
- **Attributes:** `level`, `xp`, `per`
- **Events:** `usa:levelup`, `usa:xp`
- **Slots:** —
- **Methods:** `add()`
- **Source:** [src/components/widgets/xp-bar.ts](../../src/components/widgets/xp-bar.ts)

## Minimal example

```html
<usa-xp-bar level="3" xp="40" per="100"></usa-xp-bar>
<script>bar.add(75); // → level 4, 15 XP</script>
```

## ES module

```js
import { defineXpBar } from 'motionary/components/widgets';

defineXpBar(); // registers <usa-xp-bar>

/* then use it in your HTML:
<usa-xp-bar level="3" xp="40" per="100"></usa-xp-bar>
*/
```
