# Studio: Collaboration, Charts & Playful Motion (17.13)

Twenty independently importable widgets in three groups (collaboration and input, data charts, playful motion). Every
element registers its `mo-*` name directly; the `usa-*` names stay available. No runtime dependency, network request,
third-party code, font or image is bundled. They read the same `--mo-kit-*` tokens as the 17.10–17.12 kits, so the
[2040 looks](./looks-17-11.md) restyle them too.

## Scope

These cover pieces that apps and product pages keep rebuilding and that Motionary did not have yet: a guided product
tour, signature capture, phone-style wheel pickers, @-mentions, an emoji panel, comment threads and code diffs; line,
funnel, treemap, Gantt and waffle charts; and eight playful motion pieces (a split-flap board, a scratch card, a
page-turning book, circular text, a pixel transition, magnet lines, text pressure and a shuffling grid). They are
original implementations written against Motionary's element base and contract rules; no outside code or assets were
copied.

Each widget enhances what is already in its children. Without JavaScript the content is shown as written (steps,
selects, the textarea, nested articles, both `pre` blocks, the task list, the pages, the faces). Under
`prefers-reduced-motion` they show the end state straight away: charts appear drawn, the split-flap changes letters
without flipping, pages and pixel faces swap without turning, the circular text, magnet lines, text pressure and
shuffle grid stand still.

## Collaboration and input

| Element | Built on | Main attributes | Events |
|---|---|---|---|
| `mo-tour` | children with `data-step` (`data-target` selector, `data-title`) and a `data-start` button; a labelled non-modal dialog with a dimmed cut-out, Escape ends it and focus returns | `open`, `label`, `next-label`, `back-label`, `done-label`, `skip-label`, `count-label` ("{n} of {total}"), `padding` | `usa:step { index }`, `usa:end { completed }` |
| `mo-signature-pad` | a canvas drawn with pointer events (smoothed, speed- and pressure-aware strokes), Undo / Clear buttons, a typed-name fallback, optional hidden form field | `label`, `color`, `width`, `name`, `clear-label`, `undo-label`, `type-label`, `placeholder` | `usa:change { empty, strokes, typed }` |
| `mo-wheel-picker` | the child `select`s, one `spinbutton` wheel each; arrow keys, Page Up / Down, Home, End; the select stays in sync and fires `input` / `change` | `label`, `rows` (odd, 3–9; 5) | `usa:change { index, values }` |
| `mo-mention-input` | the child `textarea` or `input` as a combobox with a listbox of names | `people` (comma list), `trigger` (@), `max` (6), `label`, `empty-label` | `usa:mention { name }` |
| `mo-emoji-picker` | a search field, group tabs and a grid of buttons walked with arrow keys; inserts at the caret of `for` | `for`, `label`, `search-label`, `recent-label`, `empty-label`, `columns` (8), `remember` (local storage key) | `usa:pick { emoji, name }` |
| `mo-comment-thread` | nested `article`s with `data-author`, `data-time`, `data-likes`; like buttons, reply forms and foldable replies | `label`, `you`, `reply-label`, `like-label`, `send-label`, `hide-label`, `show-label`, `show-one-label`, `placeholder` | `usa:like { index, liked, likes }`, `usa:reply { index, text }`, `usa:toggle { index, open }` |
| `mo-diff-viewer` | two child `pre`s (`data-before`, `data-after`) turned into a line table, unified or split, with changed characters marked | `mode` (unified, split), `file`, `label`, `unified-label`, `split-label`, `added-label`, `removed-label` | `usa:mode { mode }` |

## Data charts

| Element | Built on | Main attributes | Events |
|---|---|---|---|
| `mo-line-chart` | SVG lines with an area fill, a focusable plot (arrow keys move a crosshair), a tooltip, legend toggle buttons and a hidden table | `values` ("1,4,3 \| 2,2,5"), `labels`, `series`, `colors`, `label`, `unit`, `smooth`, `area`, `height` | `usa:point { index }`, `usa:toggle { series, visible }` |
| `mo-funnel-chart` | an ordered list of stage buttons, centred bars sized by share, conversion badges | `values`, `labels`, `colors`, `label`, `unit`, `conversion-label` ("{p} continue") | `usa:select { index, value, step, overall }` |
| `mo-treemap` | squarified tiles as buttons in one tab stop | `values`, `labels`, `colors`, `label`, `unit`, `ratio` (1.8) | `usa:select { index, value, share }` |
| `mo-gantt` | the child `ul`/`ol`; each `li` has `data-start`, `data-end`, optional `data-progress`, `data-color`, `data-after` | `today`, `label`, `today-label`, `done-label` | `usa:select { index }` |
| `mo-waffle-chart` | a decorative 10 × 10 grid and a legend of buttons with each share in words | `values`, `labels`, `colors`, `label`, `total`, `shape` (square, round) | `usa:select { index, value, cells }` |

## Playful motion

| Element | What it draws | Main attributes | Events |
|---|---|---|---|
| `mo-split-flap` | a departures-board row of flaps; a polite live region carries the text | `value`, `words` (cycles), `interval`, `length`, `charset`, `speed` | `usa:change { value }` |
| `mo-scratch-card` | a foil canvas over the children, rubbed away by pointer; a Reveal button for keyboard users | `color`, `label`, `reveal-label`, `threshold` (0.5), `brush` (22) | `usa:reveal { by }` |
| `mo-page-flip` | each child is a page turning around the spine; drag, swipe, arrow keys or buttons; only the open page is exposed | `index`, `label`, `prev-label`, `next-label`, `page-label` ("Page {n} of {total}") | `usa:change { index }` |
| `mo-circular-text` | text on a turning ring with the children in the middle | `text`, `separator`, `duration`, `direction` (cw, ccw), `hover` (slow, fast, reverse, pause, none), `size`, `color` | none |
| `mo-pixel-transition` | two faces (first two children) swapped behind a grid of pixels that blink in and out; the hidden face is `inert` | `grid` (12), `color`, `duration`, `trigger` (hover, click), `flipped` | `usa:change { flipped }` |
| `mo-magnet-lines` | a field of short lines that turn toward the pointer behind the children | `rows`, `columns`, `color`, `angle`, `length` | none |
| `mo-text-pressure` | letters that grow heavier and taller near the pointer; screen readers get the text once | `radius`, `min-weight`, `max-weight`, `stretch` | none |
| `mo-shuffle-grid` | children that trade places on a timer (CSS order only, so reading order stays) with a pause button | `interval`, `columns`, `gap`, `pause-label`, `play-label` | `usa:shuffle { order }` |

## Registering

```js
import { defineWidgets } from 'motionary/components/widgets';
defineWidgets('17.13'); // the twenty above

// or one at a time
import { defineLineChart } from 'motionary/widgets/line-chart';
defineLineChart();
```

The pure helpers behind them (`diffLines`, `squarify`, `linePath`, `niceTicks`, `funnelRows`, `waffleCells`,
`ganttSpan`, `mentionQuery`, `matchNames`, `tourPlace` and others) are exported from `motionary/components/widgets` too.

## Home page collections

The Collections section on the showcase home page now opens on a **New in 17.13** tab with eighteen of these widgets
running in place (the product tour and magnet lines live on the lab page). As before, nothing loads until the section
comes near the screen, and each tab loads its widgets only when opened.

Demo page for the twenty widgets: `showcase/studio.html`.
