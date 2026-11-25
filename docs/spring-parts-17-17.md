# Spring parts (17.17)

Ten everyday parts built on the 17.16 spring core and `micro()`. Every motion is a damped spring from
`createSpringGroup()`, so it can be interrupted at any moment and keeps its velocity when it is; feedback such as a
shake or a nod comes from `feedback()`. No runtime dependency, third-party code, font or image is bundled; these are
original implementations written against Motionary's element base and contract rules. They read the same `--mo-kit-*`
tokens as the 17.10–17.16 kits, so the [1530 looks](./looks-17-11.md) restyle them, and each takes the page's feel
from its `feel` attribute, a parent's `data-mo-feel` or `--mo-feel`. Under reduced motion every spring jumps to its
target and impulses do nothing; state changes are still announced.

Live demo: [`showcase/springs.html`](../showcase/springs.html) (all ten parts, a whole-page feel switch and three looks).

```js
import { defineWidgets } from 'motionary/widgets';
defineWidgets('17.17'); // or one entry each: import 'motionary/widgets/spring-like'
```

| Element | What it does | Keyboard and screen readers | Events |
|---|---|---|---|
| `<mo-spring-like>` | A like toggle: the heart squashes on press, pops past full size with a ring and a burst of dots, and the count rolls up or down. `count`, `compact` (1.2k), `dots`, `fx`. | A real toggle button with `aria-pressed`; the new state and count are announced. | `usa:change` `{ liked, count }` |
| `<mo-spring-rating>` | Stars lift on hover and pop up one after another when chosen; unrating deflates them. `max`, `half`, `readonly`, `clearable`, `show-value`, `size`. | A slider: arrow keys, Home and End; pushing past an end bumps the last star. Read-only ratings are an image with the value in their name. | `usa:change` `{ value }` |
| `<mo-spring-copy>` | Copies `text` or the text of the element named by `for`: the icon springs away and a tick pops in, or the button shakes with a cross when the browser refuses. `show-text`, `reset`. | A button; the outcome is announced. | `usa:copy` `{ ok, text }` |
| `<mo-spring-tags>` | Tags pop in and shrink away; a duplicate makes the chip that has it shake. Enter, comma or a paste with commas adds tags. `max`, `max-length`, `name`. | Each chip has a remove button; Backspace in the empty field marks and then removes the last chip; additions, removals and refusals are announced. | `usa:change` `{ tags, added, removed }`, `usa:reject` `{ text, reason }` |
| `<mo-spring-code>` | One-time-code boxes: characters pop in, focus hops along, a paste or autofill fills every box in a ripple. `reject()` shakes and clears, `accept()` nods. `length`, `mode`, `group`, `mask`, `name`. | One labelled input per character inside a group; arrows and Backspace move; the first box takes `autocomplete="one-time-code"`. | `usa:change` `{ value }`, `usa:complete` `{ value }` |
| `<mo-spring-list>` | Drag the handles to reorder: the picked item lifts and tilts with its speed, the others spring out of the way, and every move springs from where the item stood. Items are the children or `items="a|b|c"`. | Space or Enter on a handle picks up, arrows move, Space drops, Escape puts it back; every step is announced. | `usa:reorder` `{ from, to, order }` |
| `<mo-spring-swipe>` | A row that swipes open to reveal up to four actions (`actions="Archive|Delete:danger"`), with rubber-band ends and a flick to open or shut. | The ⋯ button opens and closes it (`aria-expanded`), Escape closes it; hidden actions are inert. | `usa:action` `{ index, label }`, `usa:toggle` `{ open }` |
| `<mo-spring-toasts>` | `show(text, { tone, duration })` drops a toast in with an overshoot; older toasts pile up behind it and fan out on hover or focus (their timers pause). A toast leaves after its time, with ×, Escape or a sideways swipe. `position`, `duration`, `max`. | A labelled list; toasts are announced politely, errors assertively. | `usa:show` `{ id, text, tone }`, `usa:dismiss` `{ id, reason }` |
| `<mo-spring-accordion>` | Panels open on a spring that reverses smoothly mid-way; the content drifts in after it and the chevron flips with an overshoot. Sections are the children (`data-title` or their first heading). `open`, `multiple`. | Headers are buttons with `aria-expanded` and `aria-controls`; arrows, Home and End move between them. | `usa:toggle` `{ index, open }` |
| `<mo-spring-counter>` | Digits roll on springs to each new value; new columns grow in. `decimals`, `group`, `prefix`, `suffix`, `from-zero`. | A status region that reads the plain number. | `usa:change` `{ value }` |

## Helpers

Exported from `motionary/widgets` for your own parts; all are pure functions.

| Helper | What it gives |
|---|---|
| `burstPoints(n, radius?)` | Where the dots of a burst fly to, evenly round a circle with an alternating inward step. |
| `compactCount(n)` | 999, 1.2k, 12k, 1.2M. |
| `ratingAt(x, width, max?, half?)` / `starFill(value, i)` | The rating under a pointer; how full one star is (0, 0.5, 1). |
| `parseTags(text)` / `addTags(tags, raw, max?, maxLength?)` | Tags from text; adding them with duplicate and limit checks. |
| `codeChars(text, mode?, length?)` | The characters a code field keeps from typed or pasted text. |
| `slotAt(y, tops, heights)` / `shiftFor(i, from, to, size)` | Where a dragged item belongs; how far the others move to make room. |
| `swipeOpen(offset, width, velocity?, fling?)` | Whether a swiped row ends open, by distance or flick speed. |
| `stackLayout(i, heights, expanded, gap?, peek?)` | Where toast `i` sits in a collapsed pile or a fanned-out list. |
| `counterText(value, decimals?, group?)` / `alignDigits(before, after)` | The characters a counter shows; digit columns lined up by place value. |
| `openSet(text, count, multiple?)` | Open panel indexes from an attribute. |
