# `<usa-kanban>` — Kanban board (drag-sort)

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

6.8: drag cards between columns — the card lifts and tilts toward the drag, a placeholder opens where it will land and the other cards glide aside (FLIP). Full keyboard support: Space picks up, arrows move, Space drops.

- **Category:** layout · **since** 6.8
- **Import:** `import { defineKanban } from 'motionary/components/widgets'` then `defineKanban();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/widgets.umd.js"></script>`
- **Attributes:** `label`
- **Events:** `usa:move`
- **Slots:** —
- **Methods:** `cardsOf()`, `move()`
- **Source:** [src/components/widgets/kanban.ts](../../src/components/widgets/kanban.ts)

## Minimal example

```html
<usa-kanban label="Sprint">
  <section data-title="To do">
    <h3>To do</h3>
    <div data-card>Design</div>
    <div data-card>Write docs</div>
  </section>
  <section data-title="Done"><h3>Done</h3></section>
</usa-kanban>
```

## ES module

```js
import { defineKanban } from 'motionary/components/widgets';

defineKanban(); // registers <usa-kanban>

/* then use it in your HTML:
<usa-kanban label="Sprint">
  <section data-title="To do">
    <h3>To do</h3>
    <div data-card>Design</div>
    <div data-card>Write docs</div>
  </section>
  <section data-title="Done"><h3>Done</h3></section>
</usa-kanban>
*/
```
