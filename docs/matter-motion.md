# Matter & Motion (17.6)

Thirteen independently importable widgets and six finite effects. All new elements register their `mo-*` names directly; legacy `usa-*` names remain available. No runtime dependency, network request, third-party code, font or image is bundled.

## Design references and implementation scope

Inspiration was discovered through Emil Kowalski's [X post introducing his lab](https://x.com/emilkowalski/status/2117651655680463347) and [his note on deliberate touch activation](https://x.com/emilkowalski/status/2117955432438469085). The author's [public Interaction Lab](https://aiforui.dev/lab) was inspected interactively on 2026-11-12. These are original implementations of related interaction ideas, not copies of the author's code or assets. Magnetic filings, the mesh, hold confirmation and the standalone number control are further derivations.

The visual models have explicit limits: orbital dust uses a stylized attractor, liquid metal uses an implicit metaball field, ink uses particle advection, water type uses a damped surface rather than volume-conserving fluid dynamics, and the mesh uses damped anchored points. Gray–Scott chemistry, the damped spring step response and cubic-bezier time inversion are computed directly. They are interface studies, not scientific solvers.

| Element | Main data / controls |
|---|---|
| `mo-gravity-well` | `seed`, `count`, `strength`; pointer attracts, hold gathers |
| `mo-liquid-metal` | `seed`, `strength`; pointer pulls, press adds a detached bead |
| `mo-reaction-field` | `seed`, `feed`, `kill`; `mode="dots\|contour"`, `shape="square\|disc\|pill"`; press paints or erases |
| `mo-ink-flow` | `seed`, `count`, `strength`; pointer stirs two particle colors |
| `mo-fluid-type` | `text`, `fill` (0–1); pointer or arrows tilt the liquid surface |
| `mo-magnetic-field` | `strength`; pointer controls the dipole position |
| `mo-elastic-mesh` | `strength`; press to pull, release to settle |
| `mo-spring-lab` | `stiffness`, `damping`, `mass`; analytic response, native sliders, replay |
| `mo-bezier-lab` | `x1`, `y1`, `x2`, `y2`, `duration`; draggable handles, sliders, replay |
| `mo-text-loupe` | `text`; pointer or arrows move the lens; Space toggles it |
| `mo-revision-reveal` | `draft`, `text`, `value` (0–100); native reveal slider |
| `mo-hold-action` | `label`, `complete-label`, `duration` in ms; hold Space / Enter / pointer, release or Escape cancels |
| `mo-scrub-number` | `value`, `min`, `max`, `step`, `unit`; editable input, horizontal drag, Shift precision, arrows / Page Up / Page Down / Home / End |

All support `label`, `disabled`, and `update(data)`. Updates only accept observed attributes and render supplied strings as text. Finite numeric ranges prevent invalid geometry and runaway simulation allocations; these are data-validation/performance bounds, not component-count or artifact-size caps.

## Individual imports

```js
import { defineGravityWell } from 'motionary/widgets/gravity-well';
defineGravityWell();
```

```html
<mo-gravity-well seed="7" count="1200" animated></mo-gravity-well>
```

The same naming convention applies to each row: `motionary/widgets/reaction-field` → `defineReactionField()`, for example. `defineWidgets('17.6')` registers the thirteen together. Every entry is safe to import during SSR.

## Motion, input and lifecycle

The seven canvas studies render a static first frame. `animated` explicitly enables a continuous study; `play()` enables it, `pause()` sets `paused`, and `reset()` recreates the current seed/configuration. Pointer input may run a short settling interval. Loops suspend while hidden, offscreen, disabled, paused or under reduced/gentle motion, with no hidden-time catch-up. `color` and `accent` configure their palette.

Touch scrolling is the default on canvases. Activate **Interact** before complex touch dragging; **Done** or Escape exits and restores normal scrolling. Keyboard users can focus the canvas directly: arrows move, Space toggles the held state, Enter/0 resets. Number scrubbing takes only horizontal gestures; vertical touch movement stays a page scroll. Native controls have focus and disabled states. The lab has native sliders as alternatives to curve-handle dragging.

`usa:action` reports canvas activation/reset or tool playback; `usa:change` reports supplied interaction state or parameters. Number scrubbing emits `usa:input` while adjusting and `usa:change` on commit. Hold actions emit `usa:confirm` exactly once after the full hold duration, or `usa:cancel` when interrupted. A confirmation event performs no external operation. `confirmed` and `value` are readable; call `reset()` to allow another hold.

Text-loupe copies are visual-only; the original stays readable. Revision reveal includes both supplied drafts for assistive technology. Re-rendering parameter values never replaces focused native inputs. Every component removes its owned nodes and releases observers, captures, timers, frames and animations on disconnect.

## Standalone effects

`dust-vortex`, `mercury-morph`, `chemical-bloom`, `magnetic-align`, `elastic-ripple`, `liquid-level`.

```js
import { registerDustVortex } from 'motionary/effects/dust-vortex';
import { bindEffect } from 'motionary/components/fx';
registerDustVortex();
const unbind = bindEffect(button, 'dust-vortex', { trigger: 'click', duration: 1600 });
// unbind() also cancels a currently playing overlay.
```

Or register the whole set with `registerMatterPack()` from `motionary/components/fx-matter` (`motionary/fx/matter`). They render non-intercepting, aria-hidden overlays and preserve the target's actual nodes/focus. Default duration is 1600ms of visible playback. Hidden/offscreen time is excluded. Overlays are removed on completion, unbind, target removal or live reduced-motion changes. Reduced motion skips them. `opacity`, `color`, `accent`, `seed`, `count`, `text` and renderer-specific options are optional.

Style hooks: `--usa-matter-bg`, `--usa-matter-fg`, `--usa-matter-accent`. There is no imposed component-count or package-size limit; see [size policy](size-policy.md).

Interactive examples: [Matter & Motion lab](../showcase/matter.html). APIs, attributes and events are also generated per element in [the component reference](components/README.md).
