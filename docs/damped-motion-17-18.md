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
