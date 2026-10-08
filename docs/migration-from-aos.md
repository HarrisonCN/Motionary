# Migrating from AOS (Animate On Scroll)

AOS and `motionary` work the same way at the markup level — mark elements with attributes and call `init()` — so most pages migrate with a search-and-replace.

## 1. Install and initialise

```diff
- import AOS from 'aos';
- import 'aos/dist/aos.css';
- AOS.init({ duration: 800, once: true, offset: 120 });
+ import ScrollAnimate from 'motionary';
+ ScrollAnimate.configure({ defaultDuration: 800, defaultOnce: true, defaultOffset: 120 });
+ ScrollAnimate.watch(); // like init(), and also picks up elements added later (AOS.refreshHard())
```

No stylesheet is needed: animations run through the Web Animations API (or opt into CSS classes with `useClassNames: true`).

## 2. Attributes

| AOS | motionary |
|---|---|
| `data-aos="fade-up"` | `data-sa data-sa-animation="fade-in-up"` |
| `data-aos-duration="800"` | `data-sa-duration="800"` |
| `data-aos-delay="200"` | `data-sa-delay="200"` |
| `data-aos-easing="ease-in-out"` | `data-sa-easing="ease-in-out"` (also `spring`, `soft-spring`, `heavy-bounce`, `[x1,y1,x2,y2]`) |
| `data-aos-offset="120"` | `data-sa-offset="120"` |
| `data-aos-once="true"` | `data-sa-once` (default) |
| `data-aos-mirror="true"` (animate out when scrolling past) | `data-sa-exit` |
| `data-aos-anchor-placement="top-center"` | `data-sa-threshold="0.5"` or `data-sa-root-margin="0px 0px -50% 0px"` |
| `data-aos-anchor=".other"` | `timeline()` played when `.other` enters (or `<usa-timeline>` around it) |

## 3. Animation names

| AOS | motionary |
|---|---|
| `fade` | `fade-in` |
| `fade-up` / `fade-down` | `fade-in-up` / `fade-in-down` |
| `fade-left` / `fade-right` | `fade-in-right` / `fade-in-left` (see the note below) |
| `fade-up-right` etc. | `['fade-in-up', 'fade-in-left']` (combine presets) |
| `flip-up` / `flip-down` | `flip-up` / `flip-down` |
| `flip-left` / `flip-right` | `flip-y` |
| `slide-up` / `slide-down` / `slide-left` / `slide-right` | `slide-up` / `slide-down` / `slide-right` / `slide-left` |
| `zoom-in` / `zoom-out` | `zoom-in` / `zoom-out` |
| `zoom-in-up` etc. | `['zoom-in', 'fade-in-up']` |

**Left/right naming:** AOS names the direction of travel — `fade-left` moves *towards* the left, i.e. comes in from the right. Here presets name where the element comes *from*: `fade-in-right` comes in from the right. Same for `slide-*`.

## 4. Global options

| `AOS.init({...})` | `createScrollAnimate({...})` / `configure()` |
|---|---|
| `duration`, `delay`, `easing`, `offset`, `once` | `defaultDuration`, `defaultDelay`, `defaultEasing`, `defaultOffset`, `defaultOnce` |
| `mirror: true` | per element `exit: true` (or `data-sa-exit`) |
| `disable: 'mobile'` / function | `disabled: window.matchMedia('(max-width: 600px)').matches` |
| `startEvent`, `initClassName`, `animatedClassName` | `useClassNames`, `hiddenClass`, `visibleClass` |
| `throttleDelay`, `debounceDelay` | not needed (IntersectionObserver, no scroll listener) |

## 5. Events and refresh

| AOS | motionary |
|---|---|
| `document.addEventListener('aos:in', ...)` | `onEnter` / `onStart` options, or `<scroll-animate>`'s `sa:enter` / `sa:start` events |
| `aos:out` | `onLeave` |
| `AOS.refresh()` | `ScrollAnimate.refresh()` |
| `AOS.refreshHard()` | `ScrollAnimate.watch()` handles DOM changes automatically |

`prefers-reduced-motion` is respected out of the box (AOS needs `disable`).
