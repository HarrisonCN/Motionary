# Motionary coverage and craft roadmap

The goal is a broad, beautiful and usable motion repository. Component count and artifact size have no imposed caps. Breadth is tracked through independent public capabilities, not aliases, palette variations or repeated examples. “World’s most complete / best looking” is an ambition, not a verified ranking.

The 17.7 source inventory contains **262 components** (91 core, 171 widgets), **214 reveal presets** and **156 effects**. Counts are generated from the source manifest; `mo-*` and `usa-*` aliases count once. A source implementation is not automatically a released or remotely verified feature. [Release history](../CHANGELOG.md), PR checks and npm dist-tags are the respective sources of truth.

## Coverage matrix

This is a source-based family map, not a claim that every feature in a family is finished. Representative entries describe reusable capabilities already present; proposed entries require their own implementation, docs and acceptance before being counted.

| Family | Existing representative capabilities | Next concrete gaps |
|---|---|---|
| Text and typography | Reveal, split text, typewriter, rotating and fluid type, loupe, film titles | Editable typographic treatments, expressive multilingual text layouts, selection annotations |
| Backgrounds and materials | Gradients, particles, liquid metal, reaction field, ink flow, gravity and magnetic fields | Material presets with shared tokens; fine-grained GPU/CPU fallbacks; new original procedural scenes |
| Navigation and discovery | Dock, tabs, tab bar, command palette, breadcrumbs, menus | Full sidebar layouts, announcement bar, dedicated search bar, synchronized scrollspy |
| Forms and selection | Animated native text field, switch, checkbox, date picker and Form Atelier’s twelve entries | Date range, subscription form and advanced asynchronous pagination |
| Calls to action and conversion | Magnetic / particle / hold buttons, explicit CTA popup, download menu | Pricing comparison, sticky CTA layouts, coupon entry, dedicated download button and empty-state actions |
| Media and galleries | Carousel, swipe deck, product gallery, video card, card wall, film titles | Independent expanding-card and fan carousels, robust zoomable lightbox, hotspots and captions |
| Data and inspection | Sparkline, bar/sketch charts, KPIs, file tree, timeline and terminal | Dedicated data table and JSON viewer, large-data virtualization, tree-grid navigation, filtering/sorting with accessible status |
| Spatial and physics | Tilt, depth, springs, elastic mesh, spring/Bezier labs, draggable interactions | Reusable snapping and collision compositions, direct manipulation on touch, coordinated layout choreography |
| Time and live activity | Transit, workout, upload, weather, timer and live-activity widgets | Shared real-time data adapters with cancellation; offline and interrupted-state examples |
| Feedback and overlays | Toasts, dialogs, progress, validation summary, finite draw effects | Unified placement/stacking behavior, undo flows, accessible nonblocking notifications |
| Application layouts | Page transitions, scroll scenes, layout and studio tools | Complete dashboard/editor/media-library reference compositions with responsive navigation |
| Integrations and authoring | React/Vue/Svelte/Solid/Angular helpers, typed manifest, MCP, Figma plugin | Richer framework recipes, interactive docs from contracts, composition export with required modules |

Capabilities already embedded in a compound component are credited as partial coverage. A new independent entry must add a distinct API or interaction; extracting and polishing such a capability is valid work, but visual variants alone do not inflate the inventory.

## Acceptance for each expansion

1. **Useful behavior:** real controls, coherent properties, state transitions, form semantics where appropriate; no decorative control that merely pretends to work.
2. **Visual craft:** designed default composition, typography and spacing, responsive states, focus/hover/press/disabled/error/loading/empty states relevant to the component. Shared materials should allow application-level theme overrides.
3. **Motion craft:** purposeful timing and interruption, stable focus, reduced-motion alternatives, finite feedback unless continuous motion is explicitly requested.
4. **Input and accessibility:** semantic roles, names, keyboard routes, touch targets and readable status. Test actual browser behavior across engines; an ARIA attribute alone does not prove accessibility.
5. **Lifecycle and safety:** cancellation on teardown, no detached observers/listeners/frames, inert untrusted text, bounded numeric inputs, no surprise navigation, storage or network writes.
6. **Delivery:** `mo-*` registration, individual import, current types/manifest/docs/catalog/demo, framework checks and relevant unit/browser regressions. Source counts, repository About and published demo update together after acceptance.

## Iteration sequence

| Batch | Deliverable | Current status |
|---|---|---|
| 17.6 Matter & Motion | 13 widgets, six effects, interaction laboratory | Published: GitHub and both npm package names at 17.6.0 |
| 17.7 Form Atelier | Twelve widgets, four finite feedback effects, form APIs and demo | Implemented; acceptance is recorded in [PR #187](https://github.com/HarrisonCN/Motionary/pull/187), publication in the release tags |
| Navigation and conversion | Sidebar, scrollspy, announcement/search, pricing/sticky CTA compositions | Proposed; not implemented or counted |
| Media and editorial | Expanded/fan galleries, lightbox/hotspots, editorial compositions | Proposed; not implemented or counted |
| Data and application surfaces | Virtualized exploration, tree grids, complete reference layouts | Proposed; not implemented or counted |
| System-wide visual consistency | Broader tokens, theme recipes, responsive and RTL audit | Incremental work; not a completed repository-wide audit |

This roadmap stays open as real gaps are found. Each batch should ship a coherent, reviewable capability set and fix discovered regressions before the next batch expands the surface area.
