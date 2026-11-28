# Snap & swing parts (17.20)

Six widgets you fling, spin or drag that either snap into place or swing on real physics, registered with `defineWidgets('17.20')` (or one at a time from `motionary/widgets/<name>`). They build on the 17.16 spring core, the 17.18 damped helpers and the 17.19 fling helpers: drags stretch with a rubber band past their limits, a flick is projected forward with its velocity and then snapped to a step, a detent, a slot or an edge, and the landing is a short, damped overshoot. The hanging sign is a sub-stepped damped pendulum on the shared frame scheduler. Each reads the look tokens (`--mo-kit-*`) and `feel`, works by keyboard and screen reader, and jumps to its end state under reduced motion. Original implementations; no third-party code or assets.

| Element | What it does | Attributes | Events |
|---|---|---|---|
| `mo-fling-ruler` | A ruler flung under a fixed needle to pick a value, as health apps pick a weight or height: it coasts with the flick, stretches past either end and snaps to the nearest step. A tap moves to the step under the finger. A real slider: arrows move one step, Page Up / Down one major step, Home / End to the ends. Height: `--usa-ruler-height` | `min`, `max`, `step`, `value`, `major`, `spacing`, `unit`, `label`, `disabled`, `feel`, `haptics` | `usa:input` `{ value }`, `usa:change` `{ value }` |
| `mo-fling-dial` | A rotary dial with detents, like a combination lock or a camera's mode dial: it turns with the finger, keeps spinning after a flick and clicks into the nearest option. A tap on an option turns to it; arrows turn one option (wrapping), Home / End go to the ends. Size: `--usa-dial-size` | `options`, `value`, `label`, `disabled`, `feel`, `haptics` | `usa:input` `{ value, index }`, `usa:change` `{ value, index }` |
| `mo-spring-grid` | Tiles rearranged like a phone's home screen: drag one with a mouse or press and hold on touch, and the others jiggle and spring out of its way. Space / Enter picks the focused tile up, arrows / Home / End move it, Space / Enter drops it and Escape puts everything back; each step is announced. Each child is a tile, named by `data-key` | `columns`, `gap`, `row-height`, `label`, `feel`, `haptics` | `usa:reorder` `{ from, to, order }` |
| `mo-chat-head` | A floating chat head (the `data-head` child) dragged anywhere in its frame and thrown to the nearer edge it is heading for, where it docks on a spring. While dragged a close target rises; near it a magnet pulls the head in, and letting go dismisses it (`restore()` brings it back). Arrows change side and move it up and down, Delete dismisses. Frame height: `--usa-chead-height`, head size: `--usa-chead-size` | `side`, `count`, `label`, `inset`, `feel`, `haptics` | `usa:dock` `{ side }`, `usa:dismiss`, `usa:restore`, `usa:tap` |
| `mo-fling-tabs` | Swipeable tab panels (children with `data-tab="Name"`): the indicator under the names follows the swipe, its leading edge running ahead so it stretches between two tabs, and the panel height eases to the next panel's. A flick goes one tab; past the first or last the panels resist. A real tab list: arrows, Home and End; hidden panels are inert | `index`, `label`, `feel`, `haptics` | `usa:change` `{ index, label }` |
| `mo-swing-sign` | A sign hanging from a nail on two strings that swings as a damped pendulum: drag it sideways and let go, brush it with the mouse or call `swing(force)`. A click, Enter or Space turns it to its back face (the `data-back` child) with a flip and a small swing. Width: `--usa-swing-width` | `flipped`, `length`, `label`, `feel`, `haptics` | `usa:flip` `{ flipped }` |

```html
<mo-fling-ruler min="30" max="150" step="0.5" value="62.5" unit="kg" label="Weight"></mo-fling-ruler>

<mo-fling-dial options="XS, S, M, L, XL" value="M" label="Size"></mo-fling-dial>

<mo-fling-tabs label="Product">
  <div data-tab="Overview"><p>Swipe me.</p></div>
  <div data-tab="Specs"><p>The pill follows the swipe.</p></div>
</mo-fling-tabs>

<mo-swing-sign label="Shop sign">
  <strong>OPEN</strong>
  <strong data-back>CLOSED</strong>
</mo-swing-sign>
```

Keyboard and screen readers: the ruler and the dial are `role="slider"` with `aria-valuenow` / `aria-valuetext` (the unit is read with the ruler's value); the grid is a labelled list whose tiles are focusable, with instructions and a live region for each move; the chat head is a button with its unread count in its name and a live region that says when it is closed or back; the tabs are a `tablist` with roving focus and `tabpanel`s; the sign is a toggle button (`aria-pressed`) whose hidden face is `aria-hidden`, with the face it turns to announced. Under reduced motion the ruler, dial, grid, head and tabs move without a spring, and the sign hangs still and turns over at once.

The pure helpers behind them are exported from `motionary/components/widgets`: `stepDecimals(step)`, `rulerRange(min, max, step)`, `rulerValue(i, min, step, steps)`, `rulerIndex(value, min, step, steps)`, `rulerRest(position, velocity, steps)`, `parseDialOptions(text)`, `dialAngle(x, y, cx, cy)`, `dialDelta(a, b)`, `detentAt(rotation, n)`, `detentRotation(index, n, rotation)`, `dialRest(rotation, velocity, n)`, `gridSlot(i, cols, cell, gap, rowH)`, `slotAtPoint(x, y, cols, cell, gap, count, rowH)`, `slotStep(index, key, cols, count)`, `gridReorder(n, from, to)`, `headRest(x, y, vx, vy, size, fw, fh, inset)`, `magnetPull(x, y, tx, ty, radius)`, `indicatorAt(p, rects)`, `pendulumStep(angle, velocity, dt, length, damping)`, `swingImpulse(vx, length)`, `pendulumAtRest(angle, velocity)` and `RULER_MAX_STEPS`.

Demo page: `showcase/snap.html`, also the first tab of the home Collections section. Every demo there has a "</> Code" drawer, and each part is a Store card with HTML, ES module, React, Vue and desktop code.
