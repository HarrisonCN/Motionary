# Blocks, Parts & Depth (17.11)

Twenty independently importable widgets in three groups: page blocks, interface parts, and motion and depth surfaces.
Every element registers its `mo-*` name directly; the `usa-*` names stay available. No runtime dependency, network
request, third-party code, font or image is bundled.

## Scope

The list comes from patterns that were still missing from the gallery after 17.10: page furniture (search, sign-up,
download, footer, dividers, scroll hints), application parts (long lists, paging, context menus, split views, windows,
stacked cards, shared-element dialogs) and scroll or pointer driven depth effects. These are original implementations
written against Motionary's element base, frame loop and contract rules; no outside code or assets were copied.

Each widget enhances what is already in its children. Without JavaScript the content is shown as written. Under
`prefers-reduced-motion` they show the end state straight away: the scroll zoom and the image tunnel become plain
layouts, the orbit gallery and the clothesline stand still, the border beam is a still gradient border.

## Page blocks

| Element | Built on | Main attributes | Events |
|---|---|---|---|
| `mo-search-bar` | `form role="search"` + `input type="search"`, ARIA combobox for suggestions | `label`, `placeholder`, `suggestions` or child `option`s, `shortcut` (`/`), `expanded`, `width` (320px), `name` (q) | `usa:search { query }`, `usa:toggle { expanded }` |
| `mo-subscribe` | email `input` + `button` in one form, polite live region | `label`, `placeholder`, `button-label`, `success`, `invalid`; methods `done()`, `error(message)`, `reset()` | `usa:subscribe { email }` (cancelable), `usa:done`, `usa:error { message }` |
| `mo-download-button` | native `button` with `aria-busy`, progress read out in tens | `label`, `done-label`, `progress` (0–100), `duration` (ms; 0 = driven by the page), `once` | `usa:start`, `usa:done` |
| `mo-reveal-footer` | `footer` around the children | `shift` (0–100; 50), `landmark` (on unless "false") | `usa:reveal` |
| `mo-shape-divider` | decorative SVG, `aria-hidden` | `shape` (wave, curve, tilt, arrow, zigzag, steps), `height` (80), `position` (top, bottom), `flip`, `color`, `layers` (1–3), `animate` | none |
| `mo-scroll-cue` | a real `button` that scrolls to `target` | `kind` (mouse, chevron, line), `label`, `target`, `hide-after` (40), `text` | `usa:hide`, `usa:show` |

`mo-subscribe` never sends anything itself. If no listener cancels `usa:subscribe` it shows the thank-you state at
once; a listener that cancels it calls `done()` or `error(message)` when its own request finishes.

## Interface parts

| Element | Built on | Main attributes | Events |
|---|---|---|---|
| `mo-virtual-list` | focusable `role="list"` region, rows with `aria-setsize` / `aria-posinset` | `row-height` (40), `height` (320px), `overscan` (4), `label`; `items` and `render` properties, `scrollToIndex(i)` | `usa:range { start, end }` |
| `mo-infinite-scroll` | IntersectionObserver sentinel + a real "Load more" button, polite live region | `root-margin` (200px), `auto`, `label`, `button-label`, `end-label`, `stagger` (40); methods `done()`, `end()`, `reset()` | `usa:load { page }`, `usa:end` |
| `mo-context-menu` | ARIA menu from the `menu` (or `[data-menu]`) child | `label`, `long-press` (ms; 500) | `usa:open { x, y }`, `usa:select { index, label }`, `usa:close` |
| `mo-split-pane` | `role="separator"` with `aria-valuenow`, tied to the first pane | `orientation`, `position` (50), `min` (10), `max` (90), `step` (5), `height`, `label` | `usa:change { position }` |
| `mo-desktop-windows` | windows with focusable title bars, a dock of toggle buttons | `height` (420px), `label`, `close-label`; `data-title`, `data-width` on children | `usa:focus`, `usa:close`, `usa:open { index }`, `usa:move { index, x, y }` |
| `mo-stack-slider` | region with previous / next buttons; back cards `inert` | `index`, `visible` (1–5; 3), `loop`, `label`, `prev-label`, `next-label` | `usa:change { index }` |
| `mo-morph-card` | card `button` + native modal `<dialog>` (one FLIP morph) | `label`, `close-label`; the `[data-detail]` child is the dialog content | `usa:open`, `usa:close` |

The context menu opens on right-click, a long press on touch, the Menu key or Shift+F10; Shift with right-click keeps
the browser's own menu. The infinite scroll keeps its button for keyboards, for `auto="false"` and for browsers without
IntersectionObserver.

## Motion and depth

| Element | What moves | Main attributes | Events |
|---|---|---|---|
| `mo-scroll-zoom` | a rounded media card grows to fill the screen (sticky pin), then a caption rises | `from` (0.45), `radius` (28), `length` (250vh), `min-width` (640), `label` | `usa:progress { progress }` at quarters |
| `mo-scroll-bg` | the background and text colors ease from section to section | `target` (e.g. `body`), `line` (0.5); `data-bg`, `data-fg` on sections | `usa:change { index, color }` |
| `mo-image-tunnel` | pictures fly out of the distance toward you, left and right | `depth` (1600), `length` (70vh per image), `size`, `min-width` (640), `label` | `usa:change { index }` |
| `mo-orbit-gallery` | pictures on a slowly turning 3D ring with drag inertia and a pause button | `speed` (6), `tilt` (-8), `item-width` (180), `height`, `label`, `pause-label`, `play-label` | `usa:change { index }`, `usa:select { index }` |
| `mo-clothesline` | photos pegged to a sagging line swing when the pointer brushes past | `sag` (24), `item-width` (160px), `strength` (1), `label`; method `swing(index, amount)` | `usa:swing { index }` |
| `mo-elastic-frame` | a rubber frame whose edges bow toward the pointer and wobble back | `stretch` (22), `reach` (70), `radius` (18), `fill`, `stroke`, `stroke-width` | none |
| `mo-border-beam` | a beam of light runs around the border (CSS only, `@property`) | `duration` (6s), `colors`, `length` (70deg), `width` (2), `radius` (18), `glow`, `reverse` | none |

Colors passed to `mo-scroll-bg`, `mo-elastic-frame` and `mo-border-beam` are checked with `CSS.supports` and ignored
when invalid. `mo-scroll-bg` does not check contrast, so pick pairs that read well. Browsers without `@property` show
`mo-border-beam` as a still gradient border. Every frame loop pauses off screen.

## Theming

The widgets share the kit tokens, overridable on any ancestor: `--mo-kit-ink`, `--mo-kit-paper`, `--mo-kit-accent`,
`--mo-kit-on-accent`, `--mo-kit-soft`, `--mo-kit-line` and `--mo-kit-radius`, plus border, shadow, glow, backdrop,
button, state, picture and speed tokens. [Looks](looks-17-11.md) has 324 ready-made combinations of them.

## Use

```js
import { defineSplitPane } from 'motionary/widgets/split-pane';
defineSplitPane();
```

`defineWidgets('17.11')` registers all twenty. The pure helpers are exported from `motionary/widgets` for tests and
custom layouts: `matchSuggestions`, `isEmail`, `percentLabel`, `riseProgress`, `dividerPath`, `virtualWindow`,
`placeMenu`, `clampSplit`, `clampWindow`, `stackPose`, `invertRect`, `zoomAt`, `sectionAt`, `tunnelPose`, `frontIndex`,
`ringRadius`, `sagAt`, `swingStep` and `elasticPath`.

## Showcase

- [Blocks, Parts & Depth](../showcase/blocks.html): all twenty on one page, in Chinese.
- [Looks](../showcase/looks.html): 324 ready-made styles for these widgets.
