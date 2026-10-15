# Motionary vs GSAP + ScrollTrigger

Sources: [GSAP docs](https://gsap.com/docs/v3/), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/),
[gsap.matchMedia()](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/), [GSAP standard license](https://gsap.com/licensing/).
Sizes: [README.md](./README.md#size-gzip-bytes).

## Summary

GSAP is a complete, professional animation platform: it tweens any property, and ScrollTrigger adds pinning, snapping and
scrubbing with fine control. Motionary is not a replacement for that. It covers the common scroll cases — reveal on enter,
staggered lists, timelines, scrubbed progress, parallax — at a fraction of the size. If you need pinning, `snap`, SVG morphing
or arbitrary property tweens, use GSAP for those parts.

| | GSAP 3.15.0 + ScrollTrigger | Motionary 16 |
|---|---|---|
| Size (gzip) | 44,187 B bundled | 5,617 B bundled default import |
| License | GSAP "Standard No Charge" license (free, including commercial use, with restrictions on visual no-code builders that compete with Webflow) | MIT |
| Runtime dependencies | none | none |
| Tween anything (objects, canvas, SVG attrs) | yes | no — CSS / WAAPI properties on elements |
| Pinning, snapping, horizontal pinned sections | yes | no equivalent |
| Scrubbed progress | yes (`scrub`) | yes (`progressMode: 'scroll'`, `timeline().scrub()`) |
| Timelines with labels, seek, reverse | yes | yes (smaller API) |
| Reduced motion | you opt in, typically with `gsap.matchMedia()` and a `(prefers-reduced-motion: reduce)` condition (GSAP docs) | honoured by default; `configureComponents({ reducedMotion })` to override |
| Plugins | many official plugins (SplitText, MorphSVG, Flip, Draggable, …) | its own runtime modules (text splitting, SVG morph, smooth scroll, physics, Lottie) with per-module budgets |

## Migrating

ScrollTrigger → Motionary mapping, and what has no equivalent: [migration-from-gsap-scrolltrigger.md](../migration-from-gsap-scrolltrigger.md).
