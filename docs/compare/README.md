# Motionary compared with AOS, GSAP, Lenis and Motion

These pages say where Motionary fits and where another library is the better choice. Every claim about another library
links to that library's own documentation; every size was measured with [`scripts/compare-sizes.mjs`](../../scripts/compare-sizes.mjs)
(raw numbers in [sizes.json](./sizes.json)). If something here is wrong or out of date, please open an issue.

Motionary's position in one line: **zero runtime dependencies, a gzip budget on every entry point checked in CI, and
`prefers-reduced-motion` honoured by default.** It is not a general-purpose tweening engine.

| Page | In short |
|---|---|
| [vs AOS](./aos.md) | Same attribute-driven model; Motionary adds reduced-motion handling, a JS API and framework bindings. |
| [vs GSAP + ScrollTrigger](./gsap.md) | GSAP does far more (pinning, snapping, morphing, any property). Motionary is much smaller for reveal / stagger / scrub. |
| [vs Lenis](./lenis.md) | Lenis is a dedicated smooth-scroll library. Motionary has a smaller smooth-scroll module but fewer options. |
| [vs Motion](./motion.md) | Motion is a full animation library with first-class React / Vue APIs. Motionary is scroll reveal + Web Components. |

## Size (gzip, bytes)

Measured 2026-10-15 with gzip level 9. "prebuilt" = the file as published on npm; "bundled" = a minimal import tree-shaken
and minified with rollup + terser. Different libraries do different amounts of work, so read this together with the
feature rows on each page.

| Library | What was measured | How | gzip |
|---|---|---|---:|
| AOS 2.3.4 | `aos.js` + `aos.css` | prebuilt | 6,911 |
| GSAP 3.15.0 | `gsap` + `ScrollTrigger` | bundled | 44,187 |
| Lenis 1.3.27 | `new Lenis()` | bundled | 5,382 |
| Motion 14.3.0 | `{ animate, scroll, inView }` | bundled | 26,277 |
| Motionary 16.2.0 | `dist/index.umd.js` (scroll reveal, 33 presets) | prebuilt | 9,246 |
| Motionary 16.2.0 | default import from `motionary` | bundled | 5,617 |
| Motionary 16.2.0 | `smoothScroll` from `motionary/runtime/smooth` | bundled | 3,475 |

Re-measure: `node scripts/compare-sizes.mjs --motionary <version> --write` (needs network; installs the exact versions above).
