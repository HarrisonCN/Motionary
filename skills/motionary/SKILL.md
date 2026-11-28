---
name: motionary
description: Add animation, micro-interactions and animated UI widgets to a web page with Motionary, the zero-dependency, accessible-by-default library of <mo-*> Web Components and scroll presets. Use when the user asks for scroll reveals, hover or press effects, springy or tactile controls, loading indicators, animated toggles, sliders, copy buttons, page transitions, or names Motionary, usa-* or mo-* elements.
---

# Motionary

Motionary ships animation as HTML: `<mo-*>` custom elements (rendered into the light DOM, so real text and links stay
crawlable) plus a small scroll-animation core. Every element honours `prefers-reduced-motion`, works from the keyboard and
builds on native controls. No framework is required; React, Vue, Svelte, Solid and Angular types are included.

## 1. Install and register

```bash
npm i motionary
```

Each element is registered once by its define function. Per-component entries keep bundles small:

```js
import { defineMoAliases } from 'motionary/components/mo';
import { defineReveal } from 'motionary/components/reveal';
import { defineCopyButton } from 'motionary/widgets/copy-button';

defineMoAliases();   // turns on the mo-* names for the older usa-* components
defineReveal();
defineCopyButton();  // 17.3+ widgets register their mo-* name themselves
```

No build step? Load the bundles from a CDN; they register every element under its `mo-*` name:

```html
<script src="https://unpkg.com/motionary@17/dist/components.umd.js"></script>
<script src="https://unpkg.com/motionary@17/dist/widgets.umd.js"></script>
```

Some 3D and physics widgets need a runtime prerequisite first (for example `use(spatialInstruments)` from
`motionary/runtime/spatial-instruments`). The component's doc page names it under "Requires".

## 2. Find the right component

Prefer looking up over guessing. In order:

1. The MCP server, if the user has it: `claude mcp add motionary -- npx -y -p motionary motionary-mcp`, then
   `search_components`, `get_component`, `scaffold_snippet` and `validate_snippet`.
2. `node_modules/motionary/docs/components/usa-<name>.md`: attributes, events, keyboard and an example for each tag.
3. `node_modules/motionary/dist/manifest.json` (or the site's `components.json` and `llms.txt`): every tag with its
   attributes, events and prerequisites.

A few starting points:

| Need | Element |
| --- | --- |
| Reveal on scroll | `<mo-reveal effect="fade-up">`, `<mo-stagger>` |
| Press / hover feedback | `<mo-press>`, `<mo-ripple>`, `<mo-magnetic release="spring">`, `<mo-tilt>` |
| Tactile controls | `<mo-squish-key>`, `<mo-squish-stepper>`, `<mo-analog-stick>`, `<mo-transfer-button>` |
| Small moments | `<mo-eclipse-toggle>`, `<mo-hue-orbit>`, `<mo-notch-slider>`, `<mo-bulge-volume>`, `<mo-copy-button>`, `<mo-text-reveal>`, `<mo-cart-badge>`, `<mo-chip-input>`, `<mo-code-shake>`, `<mo-elastic-accordion>` |
| Loading | `<mo-tile-relay>`, `<mo-six-dot-orbit>`, `<mo-three-dot-bounce>`, `<mo-sweep-lines>`, `<mo-spinner>`, `<mo-skeleton>` |
| Forms | `<mo-select>`, `<mo-combobox>`, `<mo-number-stepper>`, `<mo-range-slider>`, `<mo-password>` |
| Page blocks | `<mo-sidebar>`, `<mo-scrollspy>`, `<mo-pricing>`, `<mo-announcement-bar>`, `<mo-sticky-cta>`, `<mo-bento>`, `<mo-empty-state>` |
| Data and media | `<mo-data-table>`, `<mo-filter-chips>`, `<mo-json-viewer>`, `<mo-lightbox>`, `<mo-hotspots>`, `<mo-fan-carousel>`, `<mo-expand-cards>` |
| Scroll and cursor motion | `<mo-scroll-velocity>`, `<mo-horizontal-scroll>`, `<mo-path-motion>`, `<mo-cut-reveal>`, `<mo-image-trail>`, `<mo-hover-reveal-list>`, `<mo-liquid-glass>` |
| Page furniture | `<mo-search-bar>`, `<mo-subscribe>`, `<mo-download-button>`, `<mo-reveal-footer>`, `<mo-shape-divider>`, `<mo-scroll-cue>` |
| App parts | `<mo-virtual-list>`, `<mo-infinite-scroll>`, `<mo-context-menu>`, `<mo-split-pane>`, `<mo-desktop-windows>`, `<mo-stack-slider>`, `<mo-morph-card>` |
| Depth and scroll scenes | `<mo-scroll-zoom>`, `<mo-scroll-bg>`, `<mo-image-tunnel>`, `<mo-orbit-gallery>`, `<mo-clothesline>`, `<mo-elastic-frame>`, `<mo-border-beam>` |
| Small UI parts | `<mo-progress-tabs>`, `<mo-code-tabs>`, `<mo-helpful-vote>`, `<mo-share-button>`, `<mo-inline-edit>`, `<mo-tag-cloud>` |
| Data and interaction | `<mo-heatmap>`, `<mo-donut-chart>`, `<mo-sortable-list>`, `<mo-zoom-lens>`, `<mo-rating-bars>`, `<mo-checklist>` |
| Decorative motion | `<mo-meteors>`, `<mo-connect-beam>`, `<mo-retro-grid>`, `<mo-orbit-rings>`, `<mo-letter-swap>`, `<mo-ripple-grid>` |
| Collaboration and input | `<mo-tour>`, `<mo-signature-pad>`, `<mo-wheel-picker>`, `<mo-mention-input>`, `<mo-emoji-picker>`, `<mo-comment-thread>`, `<mo-diff-viewer>` |
| Charts | `<mo-line-chart>`, `<mo-funnel-chart>`, `<mo-treemap>`, `<mo-gantt>`, `<mo-waffle-chart>` |
| Playful motion | `<mo-split-flap>`, `<mo-scratch-card>`, `<mo-page-flip>`, `<mo-circular-text>`, `<mo-pixel-transition>`, `<mo-magnet-lines>`, `<mo-text-pressure>`, `<mo-shuffle-grid>` |
| Everyday UI parts | `<mo-radial-menu>`, `<mo-hover-card>`, `<mo-toggle-group>`, `<mo-time-picker>`, `<mo-color-swatches>`, `<mo-calendar-strip>`, `<mo-comparison-table>` |
| More charts | `<mo-radial-bars>`, `<mo-bar-race>`, `<mo-bullet-chart>`, `<mo-slope-chart>`, `<mo-dot-plot>` |
| Spring micro-interactions | `<mo-micro fx="press hover lift">` around any content (also `magnetic`, `tilt`, `glow`, `squish`, `drag`, `focus`; `feedback="shake"` plays an impulse), `<mo-micro-switch>`, `<mo-micro-checkbox>`, `<mo-micro-input>`, `<mo-micro-button>`, `<mo-micro-slider>`, `<mo-micro-segmented>`, `<mo-micro-stepper>`; `feel="crisp|snappy|smooth|bouncy|playful|calm|heavy"` or `data-mo-feel` on a parent |
| Spring parts | `<mo-spring-like count="12">`, `<mo-spring-rating value="4">`, `<mo-spring-copy text="…">`, `<mo-spring-tags value="a,b">`, `<mo-spring-code length="6">` (`accept()` / `reject()`), `<mo-spring-list items="a|b|c">`, `<mo-spring-swipe actions="Archive|Delete:danger">`, `<mo-spring-toasts>` (`show(text, { tone })`), `<mo-spring-accordion open="0">`, `<mo-spring-counter value="1280" group=",">`; all take `feel` and the looks |
| Damped expand and sliding | `<mo-spring-collapse label="…">`, `<mo-read-more lines="3">`, `<mo-spring-sheet snaps="0.5, 0.92">` (children with `data-sheet` go in the sheet), `<mo-spring-pager>` (each child a page), `<mo-elastic-scroll height="320px">` (`usa:edge` for pull-to-refresh), `<mo-spring-stack>` (each child a card); `springExpand(el)` / `springAllDetails()` from `motionary/components/interaction` give any box or `<details>` the same damped open |
| Fling and settle | `<mo-spring-pip>` (the `data-pip` child is the floating window), `<mo-spring-island>` (`data-compact` child is the pill), `<mo-spring-peek>` (`data-peek` child is the held preview), `<mo-spring-scrollbar height="320px">` (`data-label` children or h2/h3 name the sections), `<mo-slide-confirm label="Slide to pay">`, `<mo-spring-chain links="14">`, `<mo-fling-marquee speed="60">`; register with `defineWidgets('17.19')` |
| Snap and swing | `<mo-fling-ruler min="30" max="150" step="0.5" unit="kg">`, `<mo-fling-dial options="S, M, L">`, `<mo-spring-grid columns="4">` (each child a tile, `data-key` names it), `<mo-chat-head count="3">` (the `data-head` child is the avatar), `<mo-fling-tabs>` (children with `data-tab="Name"` are the panels), `<mo-swing-sign>` (the `data-back` child is the back face); register with `defineWidgets('17.20')` |
| Icons | `<mo-icon name="bell" motion="ring">` (753 icons in 34 categories, 12 motions), `<mo-icon-picker>` |
| Ready-made looks for those widgets | `look="neon-ocean"` (2040 names; each also sets `--mo-feel`) after `adoptLooks()`, or `applyLook(el, name)` from `motionary/components/widgets` |

## 3. Rules

- Use only the documented attributes. Changing an attribute at runtime updates the element.
- Listen for `usa:*` events (`el.addEventListener('usa:change', (e) => e.detail.value)`); they bubble and are composed.
- Do not add your own reduced-motion overrides or `transition: none` hacks; the elements already handle it.
- Keep labels as attributes or light-DOM text so screen readers get them (`label="Volume"`).
- Theme with the shared tokens: put `variant="minimal | neon | glass | brutalist | fluent | material"` on an element or
  `data-usa-variant` on an ancestor, or set `--usa-accent`, `--usa-surface`, `--usa-radius` and `--usa-font` yourself.
- Never put secrets in a copy button's `text`; its `usa:copy` event carries only `{ ok, length }`.

## 4. Check your work

- `npx -y -p motionary motionary-mcp` → `validate_snippet { mount: true }` mounts the markup in jsdom and reports
  unknown attributes, missing registration and missing prerequisites.
- In the browser, tab through every control and try it with "Reduce motion" turned on.

## Example

```html
<mo-notch-slider label="Exposure" min="-2" max="2" step="0.1" notches="5" value="0" unit=" EV"></mo-notch-slider>
<mo-copy-button text="npm i motionary"></mo-copy-button>
<script type="module">
  import { defineNotchSlider } from 'motionary/widgets/notch-slider';
  import { defineCopyButton } from 'motionary/widgets/copy-button';
  defineNotchSlider();
  defineCopyButton();
  document.querySelector('mo-notch-slider').addEventListener('usa:change', (e) => console.log(e.detail.value));
</script>
```
