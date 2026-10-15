# Motionary vs Motion

Sources: [Motion docs](https://motion.dev/docs), [Motion for React — Accessibility](https://motion.dev/docs/react-accessibility),
[Reduce bundle size](https://motion.dev/docs/react-reduce-bundle-size), [npm](https://www.npmjs.com/package/motion).
Sizes: [README.md](./README.md#size-gzip-bytes).

## Summary

Motion (formerly Framer Motion) is a full animation library with a JavaScript API and first-class React and Vue components:
layout animations, gestures, exit animations, springs, motion values. Motionary is narrower: scroll reveals driven by
attributes or hooks, plus a set of ready-made `<usa-*>` Web Components that work the same in any framework. For app UI
animation in React or Vue, Motion is the stronger tool. For content sites that mostly need reveal-on-scroll, Motionary is
smaller and needs less code.

| | Motion 14.3.0 | Motionary 16 |
|---|---|---|
| Size (gzip) | 26,277 B bundled for `{ animate, scroll, inView }` (Motion documents smaller entry points; see "Reduce bundle size") | 5,617 B bundled default import |
| License | MIT | MIT |
| React / Vue components (`<motion.div>`, layout, exit) | yes | no — framework hooks and Web Component wrappers instead |
| Scroll-linked and in-view animations | yes (`scroll`, `inView`, `useScroll`) | yes (`data-sa`, `watch()`, `progressMode: 'scroll'`) |
| Gestures, drag, layout animations | yes | some components (`<usa-draggable>`, …), no general layout animation |
| Reduced motion | React: `<MotionConfig reducedMotion="user">` disables transform and layout animations automatically, `useReducedMotion()` for custom handling (Motion docs) | honoured by default for every reveal and component |
| Ready-made UI components | Motion+ (paid) adds Motion UI components | 209 `<usa-*>` components, MIT |

We did not find an automatic reduced-motion switch for Motion's vanilla `animate()` in its JS docs; check the current docs
if you rely on it.
