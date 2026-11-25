# Micro-interaction system (17.16)

One spring core, one interaction engine and eight elements built on them. Everything that moves is a damped spring
solved in closed form, so it looks the same at 30, 60 or 144 Hz, can be interrupted at any moment and keeps its
velocity when it is. No runtime dependency, third-party code, font or image is bundled; these are original
implementations written against Motionary's element base and contract rules. The controls read the same `--mo-kit-*`
tokens as the 17.10–17.15 kits, so the [1530 looks](./looks-17-11.md) restyle them too, and a look's `--mo-kit-speed`
speeds their springs up or slows them down.

Live demo: [`showcase/micro.html`](../showcase/micro.html) (spring lab with a live curve, every behaviour, feedback
impulses, the controls, markup wiring and three looks).

## 1. Spring core — `motionary/components/physics`

| Export | What it does |
|---|---|
| `springSolution(physics, from, to, velocity?)` | The exact motion as a function of elapsed ms → `[value, velocity]`, for under-, critically and over-damped springs. |
| `springFromFeel({ duration, bounce }, mass?)` | Perceptual → physical: `duration` is the response time in ms, `bounce` runs from -1 (heavily damped) through 0 (critically damped) to 1 (springy). |
| `springFeel({ stiffness, damping, mass })` | Physical → `{ duration, bounce, dampingRatio }`. |
| `microSpring(input, feel?, speed?)` | Any description → physics: a `MICRO_SPRINGS` name, a v2.3 `SPRING_PRESETS` name, `"380ms 0.3"`, `{ duration, bounce }` or `{ stiffness, damping, mass }`; a feel and a speed factor retune it. |
| `settleTime(physics, from?, to?, velocity?, precision?)` | When a motion comes to rest, in ms. |
| `microEasing(input, feel?, points?)` | The spring as a CSS `linear()` easing and its duration, for `el.animate()` or transitions. |
| `createSpringGroup(initial, options)` | Several named values on one frame loop (on the motion clock, so `setClock()` slows or pauses them). `set()` retargets and keeps velocity, `impulse()` adds velocity, `jump()` moves without motion, each channel keeps its own spring. |
| `MICRO_SPRINGS` | Sixteen springs tuned for roles: `instant`, `snappy`, `smooth`, `gentle`, `bouncy`, `elastic`, `press`, `release`, `hover`, `toggle`, `drag`, `settle`, `pop`, `jelly`, `heavy`, `feather`. |
| `MICRO_FEELS` | Seven feels that retune every role spring at once: `crisp`, `snappy`, `smooth`, `bouncy`, `playful`, `calm`, `heavy`. |

```js
import { createSpringGroup } from 'motionary/components/physics';
const s = createSpringGroup({ x: 0, scale: 1 }, {
  spring: { duration: 420, bounce: 0.2 },
  onUpdate: (v) => (el.style.transform = `translateX(${v.x}px) scale(${v.scale})`),
});
s.set({ x: 240 });                    // set again mid-way: it turns round with its speed
s.set({ scale: 0.95 }, { spring: 'press' });
s.impulse({ x: 600 });                // a flick; it springs back to its target
```

The v2.3 `createSpring()` (numeric steps) is unchanged.

## 2. Interaction engine — `motionary/components/interaction`

`micro(el, behaviours, options)` gives any element spring micro-interactions. All behaviours write into one spring
group per element and one composed `transform` per frame, so press, hover, tilt, a magnet pull and a shake add up
instead of fighting over the same property.

| Behaviour | What it does |
|---|---|
| `press` | Dips on pointer down or Space / Enter (`pressScale`, 0.96) and springs back with a little overshoot. |
| `hover` | Grows a touch on hover (`hoverScale`, 1.03); mouse and pen only. |
| `lift` | Rises by `lift` px (4) with a shadow that deepens with height; pressing pushes it back down. |
| `magnetic` | Leans toward the pointer (`strength` 0.35, at most `reach` 14 px) and, when the pointer leaves, snaps back starting at the pointer's speed. |
| `tilt` | 3D tilt toward the pointer, up to `tilt` degrees (8). |
| `glow` | A light under the pointer in the look's accent (`--mo-micro-glow-color` to override); on touch it follows the finger while pressed. Uses `::after`. |
| `squish` | Squashes while pressed and wobbles back like jelly. |
| `drag` | 1:1 drag; past the `bounds` (parent by default) it pulls with rubber-band resistance; on release it glides on with its velocity, stays inside, snaps to `snap` px and springs into place. Arrow keys move a focused element by 16 px, or by one `snap` cell (Shift moves four times as far). |
| `focus` | A focus ring that springs in on keyboard focus, also when the focus is on a control inside. |

Feedback impulses — `feedback(el, kind)` or `handle.feedback(kind)` — add velocity to the same springs, so they mix
with whatever the element is already doing: `shake` (error), `nod`, `pop` (success), `wiggle`, `jelly`, `nudge`,
`bump`, `attention`. Elements without `micro()` get a temporary handle that cleans up when they settle.

```js
import { micro, feedback, applyMicro } from 'motionary/components/interaction';
const h = micro(button, 'press hover focus', { feel: 'bouncy', haptics: true });
feedback(form, 'shake');
h.destroy(); // restores the element

// or from markup, watching for new, changed and removed elements:
// <button data-mo-micro="press hover" data-mo-feel="snappy">Save</button>
const stop = applyMicro();
```

The feel comes from the `feel` option, the closest `[data-mo-feel]` or the `--mo-feel` custom property, so a whole
section or theme can set it. `haptics` adds short vibrations where the device supports them (off by default).
Behaviours are ignored while the element is `disabled` or `aria-disabled="true"`.

## 3. Elements

| Element | Built on | Main attributes | Events |
|---|---|---|---|
| `mo-micro` | wraps any content with the engine; `feedback(kind)` method and a `feedback` attribute | `fx` (press hover), `feel`, `spring`, `haptics`, `disabled`, `press-scale`, `hover-scale`, `lift`, `strength`, `reach`, `tilt`, `bounds` (parent, none), `snap`, `axis` (x, y, both), `feedback` | `usa:press`, `usa:release`, `usa:drag-end { x, y }` |
| `mo-micro-switch` | a `role="switch"` button; the knob stretches with its speed, widens while held, can be dragged with rubber-band ends and flicked; optional hidden input | `checked`, `disabled`, `label`, `name`, `value` (on), `size` (sm, md, lg), `feel`, `haptics` | `usa:change { checked }` |
| `mo-micro-checkbox` | a `role="checkbox"` button (`aria-checked` true, false or mixed); the box squashes, fills with a pop and draws its tick; unchecking rubs the tick out first | `checked`, `indeterminate`, `disabled`, `label`, `name`, `value`, `feel`, `haptics` | `usa:change { checked }` |
| `mo-micro-input` | a real `input` inside a `label`; floating label, focus line from the click point, one shake and an announced message when invalid (`aria-invalid`, `aria-describedby`), a tick with `success`, a character count that bumps near `maxlength` | `label`, `type`, `value`, `name`, `required`, `pattern`, `minlength`, `maxlength`, `autocomplete`, `hint`, `error`, `success`, `disabled`, `feel`, `haptics` | `usa:input { value }`, `usa:invalid { message }`, `usa:valid { value }` |
| `mo-micro-button` | a button that folds into a spinner (`aria-busy`), pops a tick or shakes with a cross, then springs back; each state is announced; `run(task)` takes a promise or a function | `label`, `loading-label`, `success-label`, `error-label`, `state` (idle, loading, success, error), `reset` (1800 ms; 0 stays), `variant` (solid, soft, ghost), `fx`, `disabled`, `feel`, `haptics` | `usa:action { run }`, `usa:state { state }` |
| `mo-micro-slider` | a `role="slider"` thumb; it trails the finger by a hair, settles onto the nearest step, squashes with speed and shows a value bubble; dragging past an end stretches the track; keys pushing past an end bump it | `min` (0), `max` (100), `step` (1), `value`, `label`, `unit`, `name`, `disabled`, `feel`, `haptics` | `usa:input { value }`, `usa:change { value }` |
| `mo-micro-segmented` | a `radiogroup`; the pill's leading edge moves on a quick spring and its trailing edge on a slow one, so it stretches toward the new choice; options dip when pressed | `options`, `values`, `value`, `label`, `name`, `disabled`, `feel`, `haptics` | `usa:change { value, index }` |
| `mo-micro-stepper` | − / + buttons and a `role="spinbutton"` number; digits roll on a spring, held buttons repeat faster and faster, at a limit the number leans against it and springs back | `min` (0), `max` (99), `step` (1), `value`, `label`, `name`, `disabled`, `feel`, `haptics` | `usa:change { value }` |

## Accessibility and performance

- Under `prefers-reduced-motion` (or `configureComponents({ motionSensitivity: 'minimal' })`) springs jump to their
  targets and impulses do nothing; feedback shows a short outline in the look's ok / bad / accent colour instead, and
  every state change still happens (and is announced where the element announces it).
- Every control works by keyboard with the usual keys for its role and has a name from its `label`.
- One frame loop per element on Motionary's shared scheduler; it sleeps when everything is at rest and stops when the
  element is detached. Each frame writes one `transform` (plus a few custom properties for glow, lift and focus).
  Pointer moves are passive listeners.
- `micro()` changes `transform` inline: put it on a wrapper (or use `<mo-micro>`) when the element already has a CSS
  transform of its own. `destroy()` puts the inline transform back.
