# Parts & Home Collections (17.12)

Eighteen independently importable widgets in three groups (UI parts, data and interaction, motion surfaces), and a
**Collections** section on the showcase home page that shows the live widgets of every recent release without opening
another page. Every element registers its `mo-*` name directly; the `usa-*` names stay available. No runtime
dependency, network request, third-party code, font or image is bundled.

## Scope

These cover small pieces that product pages keep rebuilding: tabs that advance on their own, install snippets per
package manager, "was this helpful?", share menus, click-to-edit titles, tag clouds, activity heatmaps, donut charts,
reorderable lists, image zoom, rating breakdowns and onboarding checklists, plus six decorative motion surfaces. They
are original implementations written against Motionary's element base and contract rules; no outside code or assets
were copied.

Each widget enhances what is already in its children. Without JavaScript the content is shown as written. Under
`prefers-reduced-motion` they show the end state straight away: progress tabs stop auto-advancing, meteors, retro grid,
orbit rings and ripples stand still, letter swap changes no letters.

## UI parts

| Element | Built on | Main attributes | Events |
|---|---|---|---|
| `mo-progress-tabs` | ARIA tablist; children are `section`s with a `data-tab` label | `index`, `interval` (ms, 6000; 0 = manual), `label`, `pause-label`, `play-label` | `usa:change { index }` |
| `mo-code-tabs` | ARIA tablist over `pre` children with `data-tab`, copy `button` | `index`, `group` (tabs with the same group follow each other), `label`, `copy-label`, `copied-label` | `usa:change { index, label }`, `usa:copy { index }` |
| `mo-helpful-vote` | two `aria-pressed` buttons, optional form for a reason, polite status | `question`, `yes-label`, `no-label`, `thanks`, `ask-why`, `why-label`, `send-label` | `usa:vote { vote }`, `usa:feedback { vote, text }` |
| `mo-share-button` | `button` with `aria-expanded` and a list of share links; uses `navigator.share` when `native` is set | `url`, `share-title`, `targets` (x, linkedin, facebook, reddit, email, copy), `label`, `copied-label`, `native` | `usa:open`, `usa:close`, `usa:share { target }` |
| `mo-inline-edit` | a button showing the value that turns into a labelled `input` | `value`, `label`, `placeholder`, `maxlength`, `allow-empty` | `usa:edit`, `usa:change { value, previous }`, `usa:cancel` |
| `mo-tag-cloud` | the child links or buttons, sized by `data-weight` | `min-size` (0.85), `max-size` (2.2), `still`, `label` | none |

## Data and interaction

| Element | Built on | Main attributes | Events |
|---|---|---|---|
| `mo-heatmap` | ARIA grid of day cells, arrow keys, one tab stop | `values` (comma list), `start` (date), `label`, `unit`, `colors` | `usa:select { index, value }` |
| `mo-donut-chart` | SVG arcs plus a legend of real buttons | `values`, `labels`, `colors`, `label`, `unit`, `thickness`, `center-label` | `usa:select { index, value }` |
| `mo-sortable-list` | the child `ol`/`ul`; drag by the grip or pick up with Space and move with arrows, assertive announcements | `label`, `grab-label`, `picked`, `moved`, `dropped` | `usa:sort { from, to }` |
| `mo-zoom-lens` | the child `img`; a focusable lens that follows the pointer or the arrow keys, `+` / `-` zoom | `zoom` (2.5), `size` (160), `label` | `usa:zoom { zoom }` |
| `mo-rating-bars` | one button per star level with a growing bar | `values` (five counts, 5★ first), `label`, `reviews-label`, `stars-label` | `usa:select { stars }` |
| `mo-checklist` | the child checkboxes; a progress ring and a done title | `label`, `done-label` | `usa:change { index, checked, done, total }`, `usa:complete` |

## Motion surfaces

| Element | What it draws | Main attributes | Events |
|---|---|---|---|
| `mo-meteors` | falling streaks behind the children | `count` (18), `angle` (215), `color`, `speed` | none |
| `mo-connect-beam` | animated SVG curves between children marked `data-beam` | `links` ("a>b, a>c"), `curve`, `colors`, `duration` | none |
| `mo-retro-grid` | a perspective grid scrolling to the horizon, optional sun | `angle`, `cell`, `color`, `speed`, `sun` | none |
| `mo-orbit-rings` | children placed on rings that turn; hover or focus pauses them | `radius` (list), `duration`, `label` | none |
| `mo-letter-swap` | a word whose letters roll on hover or focus of its link or button | `stagger` (ms), `direction` (up, down) | none |
| `mo-ripple-grid` | a dot grid that ripples out from a click, a key press or on its own | `gap`, `dot`, `color`, `accent`, `auto`, `label` | `usa:ripple { x, y }` |

## Registering

```js
import { defineWidgets } from 'motionary/components/widgets';
defineWidgets('17.12'); // the eighteen above

// or one at a time
import { defineHeatmap } from 'motionary/widgets/heatmap';
defineHeatmap();
```

## Home page collections

The showcase home page has a **Collections** section with one tab per release (17.12 back to 17.4). Each tab shows
the release's widgets running, with a short note and a link to the full lab page. Widgets load only when their tab is
opened, so the home page costs nothing extra until someone scrolls to it. Tabs can be linked directly, for example
`index.html#collections-blocks`. The separate lab pages are unchanged and stay the place for every option.

Demo page for the eighteen widgets: `showcase/parts.html`.
