# Motionary vs AOS (Animate On Scroll)

Sources: [AOS README](https://github.com/michalsnik/aos) (the `next` branch README, which documents the same
`data-aos-*` options as 2.3.4) and the [npm registry](https://www.npmjs.com/package/aos). Sizes: [README.md](./README.md#size-gzip-bytes).

## Summary

AOS and Motionary use the same model: mark elements with attributes, call one init function. AOS is small and well
known; its latest stable release on npm is **2.3.4, published October 2018** (3.0.0 stayed in beta). Pick Motionary if you
want reduced-motion handling without extra code, a JS API and framework bindings; keep AOS if it already works for you
and you do not need those.

| | AOS 2.3.4 | Motionary 16 |
|---|---|---|
| Size (gzip) | 6,911 B (js + required css) | 5,617 B bundled default import · 9,246 B UMD; no stylesheet needed |
| Runtime dependencies | none | none |
| License | MIT | MIT |
| Model | `data-aos="fade-up"` + `AOS.init()`; animations are CSS transitions | `data-sa data-sa-animation="fade-in-up"` + `init()` / `watch()`; Web Animations API (CSS classes optional) |
| Animations | 27 fades / flips / slides / zooms ([list](https://github.com/michalsnik/aos#animations)) | 33 in the core, 181 more in `motionary/presets/extended` |
| Duration / delay | 50–3000 ms in 50 ms steps unless you add CSS (AOS README, "Caveats") | any value |
| DOM changes | MutationObserver, `refreshHard()` | `watch()` picks up added elements |
| Events | `aos:in` / `aos:out` on `document` | per-element callbacks and `usa:*` events |
| Reduced motion | no built-in option in the README; you can pass your own check to `disable` (it accepts a boolean, expression or function) | honoured by default ([accessibility.md](../accessibility.md)) |
| Frameworks | plain JS | `motionary/react`, `vue`, `svelte`, `solid`, `angular`; SSR-safe imports |
| Beyond reveal | — | timelines, stagger, parallax, scrubbed progress, 209 `<usa-*>` components (optional) |

## What AOS does that Motionary does not do the same way

- `data-aos-anchor` (trigger on another element) has no one-attribute equivalent; use a `timeline()` played when the other element enters ([migration guide](../migration-from-aos.md)).
- AOS's nine `anchor-placement` keywords map to `data-sa-threshold` / `data-sa-root-margin`, not one-to-one.

## Migrating

Step-by-step attribute mapping: [migration-from-aos.md](../migration-from-aos.md).
