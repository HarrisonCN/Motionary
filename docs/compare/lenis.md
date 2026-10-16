# Motionary vs Lenis

Sources: [Lenis README](https://github.com/darkroomengineering/lenis) (settings, "Reduced motion", "Limitations"),
[Motionary smooth-scroll module](../runtime/smooth.md). Sizes: [README.md](./README.md#size-gzip-bytes).

## Summary

Lenis does one thing — smooth scrolling on top of native scroll — and does it with many options, framework packages
(`lenis/react`, `lenis/vue`, Framer) and a snap plugin. Motionary is a scroll-animation library that also ships a smooth-scroll
module (`motionary/runtime/smooth`). If smooth scrolling is all you need, or you need Lenis's options (infinite scroll,
`syncTouch`, nested-scroll handling, snap), use Lenis. If you already use Motionary for reveals, its module saves a dependency.
The two can also be combined: Lenis keeps native scroll events, which Motionary's observers use.

| | Lenis 1.3.27 | `motionary/runtime/smooth` (16) |
|---|---|---|
| Size (gzip) | 5,382 B bundled (plus optional `lenis.css`) | 3,475 B bundled (budget 3.5 KB, enforced in CI) |
| License | MIT | MIT |
| Native scroll underneath | yes | yes (real scroll events) |
| Reduced motion | honoured by default (`respectReducedMotion: true`): smoothing off, programmatic scrolls instant | off while `prefers-reduced-motion: reduce` matches, re-enabled live |
| Anchor links | `anchors: true` | anchors glide |
| Horizontal / nested / infinite / touch sync | yes (`orientation`, `allowNestedScroll`, `infinite`, `syncTouch`) | window or any scroll container; fewer options |
| Snap | `lenis/snap` plugin | `motionary/runtime/drag-snap` is for drag, not scroll snap |
| Framework packages | React, Vue, Framer | uses the generic Motionary bindings |

Lenis documents its own limitations (Safari 60 fps cap, iframes, iOS < 16 with `syncTouch`) in its README; smooth scrolling
in Motionary is subject to the same browser behaviour.
