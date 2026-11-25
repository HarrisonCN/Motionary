# Toolkit: UI Parts & Charts (17.15)

Twelve independently importable widgets in two groups (everyday UI parts and data charts). Every element registers its
`mo-*` name directly; the `usa-*` names stay available. No runtime dependency, network request, third-party code,
font or image is bundled. They read the same `--mo-kit-*` tokens as the 17.10–17.13 kits, so the
[1530 looks](./looks-17-11.md) restyle them too.

## Scope

These cover pieces that product pages and apps keep rebuilding and that Motionary did not have yet: a radial action
menu, a hover preview card, a toggle button group, a compact time field, colour swatches, a week strip of dates and a
plan comparison table; and five more charts (radial progress bars, a bar chart race, bullet charts against targets, a
before / after slope chart and a dot or dumbbell plot). They are original implementations written against Motionary's
element base and contract rules; no outside code or assets were copied.

Every part works by keyboard and labels itself for screen readers. Charts that move hide the moving drawing from
screen readers and write the same numbers out as text or button labels. Under `prefers-reduced-motion` they show the
end state straight away: arcs, bars, lines and dots appear drawn, and the bar race does not play by itself.

## Everyday UI parts

| Element | Built on | Main attributes | Events |
|---|---|---|---|
| `mo-radial-menu` | its own child buttons or links, moved onto a circle around a toggle button (`aria-expanded`); arrow keys go round, Home / End jump, Escape closes and focus returns to the toggle; the children are put back on removal | `open`, `label` (Menu), `radius` (84), `start` (degrees, -90 = up), `spread` (degrees; 360), `icon` (＋) | `usa:toggle { open }`, `usa:select { index, label }` |
| `mo-hover-card` | a `data-trigger` child and a `data-card` child; the card opens after `open-delay` on pointer rest or focus, stays while the pointer is on it, describes the trigger (`aria-describedby`); Escape closes; touch alone does not open it | `open-delay` (300), `close-delay` (200), `placement` (bottom, top, start, end), `open` | `usa:toggle { open }` |
| `mo-toggle-group` | a group of `aria-pressed` buttons with roving focus; `required` keeps one pressed; optional hidden input | `options`, `values`, `value`, `multiple`, `required`, `name`, `label`, `size` (sm, md, lg) | `usa:change { value, index }` (`value` is an array) |
| `mo-time-picker` | hour and minute `spinbutton`s with small step buttons; arrow keys step (minutes snap to `step`), Page Up / Down step hours, digits type a part; optional AM / PM button; value always 24-hour "HH:MM" | `value`, `step` (5), `hour12`, `name`, `label`, `hour-label`, `minute-label`, `am-label`, `pm-label` | `usa:change { value }` |
| `mo-color-swatches` | a `radiogroup` of swatch buttons; the check is black or white, whichever reads better on the colour; the picked name shows beside the row | `colors`, `names`, `value`, `name`, `label`, `shape` (circle, square), `size` (32) | `usa:change { value, index, name }` |
| `mo-calendar-strip` | a row of day buttons (`aria-pressed`, today `aria-current="date"`), earlier / later buttons, a polite month heading; arrow keys page past the ends; dates are "YYYY-MM-DD" | `value`, `start`, `days` (3–14; 7), `week-start` (1), `marks`, `min`, `max`, `locale`, `label`, `prev-label`, `next-label`, `name` | `usa:change { value }`, `usa:page { start }` |
| `mo-comparison-table` | a child `table`: yes / no cells get a check or a cross (the words stay for screen readers), a highlighted column with a badge, a sticky first column in a scrollable region, and an "Only differences" switch; the table is put back unchanged on removal | `highlight` (column, from 1), `badge-label` (Popular), `diff-label` (Only differences), `differences`, `label` | `usa:filter { differences, hidden }` |

## Data charts

| Element | Built on | Main attributes | Events |
|---|---|---|---|
| `mo-radial-bars` | concentric three-quarter SVG arcs (an image with every value in its label) and a legend of buttons that pick a ring | `values`, `max` (100, or one per ring), `labels`, `colors`, `unit`, `label`, `size` (220) | `usa:select { index, value, max }` |
| `mo-bar-race` | ranked bars that glide to their places frame by frame, a frame name, play / pause and a range slider; a text line gives the current ranking | `labels`, `frames` ("2023 \| 2024"), `values` ("1,2,3; 4,5,6"), `colors`, `top` (8), `interval` (1600), `unit`, `label`, `play-label`, `pause-label`, `frame-label` | `usa:frame { index, name, leader }` |
| `mo-bullet-chart` | one button per measure: a value bar, a target line and qualitative bands; a check when the target is met | `values`, `targets`, `labels`, `ranges` (0.5,0.8,1), `max`, `colors`, `unit`, `label`, `target-label`, `met-label`, `missed-label` | `usa:select { index, value, target, met }` |
| `mo-slope-chart` | SVG lines from before to after (green up, red down, grey flat) with end labels pushed apart, and a list of buttons with each change in percent | `before`, `after`, `labels`, `from-label`, `to-label`, `unit`, `label` | `usa:select { index, before, after, change }` |
| `mo-dot-plot` | one button per row with a dot on a shared scale, or a dumbbell to a second series with `compare`; grid lines at round numbers and a legend | `values`, `compare`, `labels`, `series`, `min`, `max`, `unit`, `label` | `usa:select { index, value, compare }` |

## Registering

```js
import { defineWidgets } from 'motionary/components/widgets';
defineWidgets('17.15'); // the twelve above

// or one at a time
import { defineBarRace } from 'motionary/widgets/bar-race';
defineBarRace();
```

The pure helpers behind them (`radialSpots`, `stepTime`, `inkOn`, `weekStartOf`, `rowDiffers`, `cellMark`, `arcDash`,
`raceRanks`, `frameValues`, `spreadLabels` and others) are exported from `motionary/components/widgets` too.

## Home page collections

The Collections section on the showcase home page now opens on a **New in 17.15** tab with all twelve widgets running
in place. As before, nothing loads until the section comes near the screen, and each tab loads its widgets only when
opened.

Demo page for the twelve widgets: `showcase/toolkit.html`.
