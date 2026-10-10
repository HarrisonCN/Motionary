# `<usa-leaderboard>` — Leaderboard

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

7.5: a ranked list — when scores change, rows glide to their new rank, climbers flash green with ▲n and fallers red with ▼n, scores roll and the top three get medals.

- **Category:** ui · **since** 7.5
- **Import:** `import { defineLeaderboard } from 'motionary/components/widgets'` then `defineLeaderboard();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `label`, `limit`, `me`
- **Events:** `usa:rank`
- **Slots:** —
- **Methods:** `setScore()`
- **Source:** [src/components/widgets/leaderboard.ts](../../src/components/widgets/leaderboard.ts)

## Minimal example

```html
<usa-leaderboard me="Ada">
  <li data-score="980">Ada</li>
  <li data-score="870">Alan</li>
  <li data-score="760">Grace</li>
</usa-leaderboard>
<script>board.setScore('Grace', 1000);</script>
```

## ES module

```js
import { defineLeaderboard } from 'motionary/components/widgets';

defineLeaderboard(); // registers <usa-leaderboard>

/* then use it in your HTML:
<usa-leaderboard me="Ada">
  <li data-score="980">Ada</li>
  <li data-score="870">Alan</li>
  <li data-score="760">Grace</li>
</usa-leaderboard>
*/
```
