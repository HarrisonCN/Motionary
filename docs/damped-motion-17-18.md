# Damped motion (17.18)

Expanding panels and the showcase pages now move with damping: a short, settling overshoot on the way open, a calm glide on the way closed, and content that drifts in after the panel rather than popping. Everything is built on the 17.16 spring core (`createSpringGroup`, `microEasing`) and the 10.4 smooth-scroll runtime. Original implementations; no third-party code or assets.

## Library: `springExpand()`, `springDetails()`, `springAllDetails()`

From `motionary/components/interaction`:

```js
import { springExpand, springDetails, springAllDetails } from 'motionary/components/interaction';

springExpand(panel, true);          // open a box toggled with `hidden`
springExpand(detailsEl);            // toggle a <details>
springDetails(detailsEl);           // its summary click springs from now on
springAllDetails(document);         // every <details> on the page, now and later (one listener)
```

- The height follows a spring (default `{ duration: 520, bounce: 0.16 }` to open, `{ duration: 360, bounce: 0 }` to close). A second toggle mid-way retargets the same spring, so it reverses from where it is, with its velocity. The returned promise resolves with the final state for every caller.
- The children fade in and slide `drift` px (default 10) after the height, one by one (`stagger`, default 0.08 of the motion), and leave ahead of it on close. `expandContentAt(p, i, n)` is the pure function behind it.
- While it moves the box has `data-mo-expanding`, `--mo-expand` (0…1) and `--mo-expand-turn` (a bouncier channel for a chevron). At rest they are removed; give the open state its own value, e.g. `details[open] { --mo-expand-turn: 1 }`.
- `<details>` stays `open` for the whole closing motion and loses it only when the motion has settled, so the toggle event, find-in-page and screen readers behave as with the native element.
- The content height is measured every frame, so panels that paint their content after opening (lazy code, images) are followed.
- `springAllDetails()` leaves `<details>` inside a custom element (components own theirs), inside `[data-mo-expand="off"]`, and summary clicks on links or controls placed inside a summary.
- Reduced motion: it toggles at once.

## Smooth scrolling

- `motionary/runtime/smooth` no longer smooths a wheel event that a component already took (`preventDefault()` by a knob, a picker, a map).
- `smoothScroll()` from `motionary/components/page` now leaves nested scrollers (code boxes, side panels) and `[data-smooth-ignore]` alone, as the runtime module already did.

## Showcase

`showcase/damped.js` runs on every showcase page (except the thumbnail and sandbox frames):

- every "</> Code" drawer and other `<details>` opens and closes on the spring above, with the chevron flipping on its own bouncier spring;
- the component gallery's code box opens and closes on it too, while the grid re-flows with `flip()`;
- the Store's detail sheet grows out of its card on a spring (view transitions use the same curve through `--mo-spring-ease` / `--mo-spring-dur`), its parts drift in one by one, and it can be pulled down by its header: rubber band upward, springs back if let go early, closes past a third of its height or on a downward flick;
- cards rise in on a spring, a few at a time, as they scroll into view and when a Collections tab opens;
- wheel scrolling glides with damping (`smoothScroll({ lerp: 0.11 })` from the runtime); touch, keyboard, scrollbar, find-in-page and nested scrollers stay native, and the Store sheet is left out.

All of it is off under `prefers-reduced-motion`, and `localStorage['motionary:damped'] = 'off'` turns it off for a visitor. If the library cannot be loaded the pages behave as before.

## Damped parts

Six widgets with the same damped, physical slide, registered with `defineWidgets('17.18')` (or one at a time from `motionary/widgets/<name>`). All motion runs on the spring core; each reads the look tokens (`--mo-kit-*`) and `feel`, works by keyboard and screen reader, and jumps to its end state under reduced motion.

| Element | What it does | Attributes | Events |
|---|---|---|---|
| `mo-spring-collapse` | One collapsible panel on `springExpand()`; the chevron flips on its own bouncier spring | `label`, `open`, `disabled`, `feel`, `haptics` | `usa:toggle` `{ open }` |
| `mo-read-more` | Text clamped to `lines` that unfolds on a spring while the fade melts away; no button when it fits | `lines`, `more`, `less`, `open`, `feel` | `usa:toggle` `{ open }` |
| `mo-spring-sheet` | A bottom sheet in its own frame: follows the finger, rubber band past its top snap, a release is carried by its speed to a snap or closed; the backdrop dims with it. Children with `data-sheet` go in the sheet. Frame height: `--usa-dsheet-height` | `snaps`, `open`, `label`, `trigger`, `feel`, `haptics` | `usa:snap` `{ index }` (-1 closed) |
| `mo-spring-pager` | Pages with rubber-band ends and one page per flick; the dots stretch toward the page they head for | `index`, `label`, `feel`, `haptics` | `usa:change` `{ index }` |
| `mo-elastic-scroll` | A native scroll area whose ends stretch on wheel and touch and spring back (iOS keeps its own bounce) | `height`, `label`, `feel`, `haptics` | `usa:edge` `{ edge }` past 56 px |
| `mo-spring-stack` | A pile of cards that unrolls into a list in a cascade of springs and gathers back | `open`, `more`, `less`, `peek`, `gap`, `feel`, `haptics` | `usa:toggle` `{ open }` |

```html
<mo-spring-sheet snaps="0.45, 0.9">
  <p>Page content</p>
  <div data-sheet><h3>Filters</h3>…</div>
</mo-spring-sheet>
```

Keyboard: the collapse, read-more and stack toggles are buttons with `aria-expanded`; the sheet's grabber steps through the snaps on Enter and moves with the arrow keys, Escape closes the sheet (focus returns to its trigger) and the stack; the pager's arrows, dots, the arrow keys, Home and End turn pages, and pages out of view are inert.

The pure helpers behind them are exported from `motionary/components/widgets`: `parseSnaps(text)`, `sheetRest(shown, velocity, snaps)`, `pageAfter(offset, velocity, width, count, from)`, `dampedAt(position, min, max, dimension)`, `pilePose(i, heights, t, peek, gap)` and `linesHeight(lines, lineHeight)`. Demo page: `showcase/damped.html`, also the first tab of the home Collections section.
