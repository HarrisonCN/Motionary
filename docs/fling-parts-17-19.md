# Fling parts (17.19)

Seven widgets that follow the finger, keep their release speed and settle on a spring, registered with `defineWidgets('17.19')` (or one at a time from `motionary/widgets/<name>`). They build on the 17.16 spring core and the 17.18 damped helpers: drags stretch with a rubber band past their limits, a flick is projected forward with its velocity, and the landing is a short, damped overshoot. Each reads the look tokens (`--mo-kit-*`) and `feel`, works by keyboard and screen reader, and jumps to its end state under reduced motion. Original implementations; no third-party code or assets.

| Element | What it does | Attributes | Events |
|---|---|---|---|
| `mo-spring-pip` | A floating picture-in-picture window (the `data-pip` child) that is flung to the nearest corner its release speed points at, and stays placed when the frame resizes. Arrow keys move it corner to corner. Frame height: `--usa-pip-height`, window width: `--usa-pip-width` | `corner`, `inset`, `label`, `feel`, `haptics` | `usa:corner` `{ corner }` |
| `mo-spring-island` | A pill that grows into a card on a spring: width, height and radius move together and the content fades in after them. The `data-compact` child is the pill, the rest is the card. Escape, the close button or a press outside collapse it; `pulse()` gives it a nudge | `expanded`, `label`, `close`, `feel`, `haptics` | `usa:toggle` `{ expanded }` |
| `mo-spring-peek` | Press and hold a card to lift a preview (the `data-peek` child) out of it in a modal dialog; pull it down or let go on the backdrop to put it back. Enter, Space, the context-menu key or Shift+F10 open it | `delay`, `label`, `close`, `feel`, `haptics` | `usa:toggle` `{ open }`, `usa:tap` |
| `mo-spring-scrollbar` | A scroll area with a thumb that trails the content on a spring, squashes at the ends and shows a bubble with the section under it (children with `data-label`, or the h2 / h3 headings). Drag the thumb or press the track to page | `height`, `label`, `feel` | `usa:section` `{ index, label }` |
| `mo-slide-confirm` | Slide to confirm: the knob stretches past its end, a weak or short drag springs back with its velocity, and a long or fast one confirms. Enter or Space on the knob confirms too; `reset()` brings it back | `label`, `done`, `threshold`, `confirmed`, `disabled`, `feel`, `haptics` | `usa:confirm`, `usa:reset` |
| `mo-spring-chain` | A decorative chain of links that trails the pointer on sub-stepped springs and drifts in a figure eight when left alone; `pluck()` shakes it. Colour: `--usa-chain-color`, height: `--usa-chain-height` | `links`, `size`, `label`, `feel` | none |
| `mo-fling-marquee` | A looping marquee you can grab, drag and fling: it coasts with the flick, then eases back to its cruising speed. It slows to a stop on hover or when focus is inside, and has a pause button. Arrow keys push it | `speed`, `gap`, `paused`, `label`, `haptics` | `usa:pause` `{ paused }` |

```html
<mo-spring-pip corner="bottom-right">
  <p>Page content</p>
  <div data-pip>Now playing</div>
</mo-spring-pip>

<mo-spring-island label="Timer">
  <span data-compact>⏱ 04:12</span>
  <p>Focus session · 25 min</p>
</mo-spring-island>

<mo-slide-confirm label="Slide to pay" done="Paid"></mo-slide-confirm>
```

Keyboard and screen readers: the pip window, the island's pill, the peek card, the scroll area and the slide knob are all focusable with names from `label`; the island's pill and the peek card report their state (`aria-expanded`, `aria-haspopup="dialog"`); the slide reports "confirmed" in a live region; the marquee's copies are hidden from screen readers and inert, and the chain is a labelled image. Under reduced motion the pip and island jump, the peek opens at once, the scrollbar thumb follows without a spring, the slide snaps, the chain stands still in its rest curve and the marquee becomes a plain horizontal scroller.

The pure helpers behind them are exported from `motionary/components/widgets`: `parseCorner(text)`, `cornerPoint(corner, w, h, fw, fh, inset)`, `pipCorner(x, y, vx, vy, w, h, fw, fh)`, `cornerStep(corner, key)`, `islandShape(t, compact, expanded, radius)`, `thumbMetrics(scrollTop, scrollHeight, clientHeight, track, min)`, `scrollForThumb(offset, size, track, scrollHeight, clientHeight)`, `labelAt(tops, scrollTop, lead)`, `slideOutcome(x, v, max, threshold)`, `chainPath(points)`, `linkSize(i, n, head)`, `wrapOffset(x, period)` and `cruise(v, target, dt, tau)`.

Demo page: `showcase/fling.html`, also the first tab of the home Collections section. Every demo there has a "</> Code" drawer, and each part is a Store card with HTML, ES module, React, Vue and desktop code.
