# `<usa-story>` — Story: before / after

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

5.4: <usa-story template="compare"> wipes from before to after as you scroll; the handle is draggable and a keyboard slider (←/→, Home/End). Full-page templates (pin, gallery, zoom) live on the Scroll stories page.

- **Category:** fx
- **Import:** `import { defineStory } from 'motionary/components/effects'` then `defineStory();`
- **CDN:** `<script src="https://unpkg.com/motionary@12/dist/components.umd.js"></script>`
- **Attributes:** `template`, `zoom`, `label`
- **Events:** `usa:step`
- **Slots:** —
- **Methods:** —
- **Source:** [src/components/effects/story.ts](../../src/components/effects/story.ts)

## Minimal example

```html
<usa-story template="compare" label="2019 vs 2026">
  <div data-sticky>
    <img data-before src="before.jpg" alt="Before">
    <img data-after src="after.jpg" alt="After">
  </div>
</usa-story>
```

## ES module

```js
import { defineStory } from 'motionary/components/effects';

defineStory(); // registers <usa-story>

/* then use it in your HTML:
<usa-story template="compare" label="2019 vs 2026">
  <div data-sticky>
    <img data-before src="before.jpg" alt="Before">
    <img data-after src="after.jpg" alt="After">
  </div>
</usa-story>
*/
```

## Variants

### Story: before / after

5.4: <usa-story template="compare"> wipes from before to after as you scroll; the handle is draggable and a keyboard slider (←/→, Home/End). Full-page templates (pin, gallery, zoom) live on the Scroll stories page.

```html
<usa-story template="compare" label="2019 vs 2026">
  <div data-sticky>
    <img data-before src="before.jpg" alt="Before">
    <img data-after src="after.jpg" alt="After">
  </div>
</usa-story>
```

### Story: data counters

5.4: template="counter" counts every [data-count] up (easing out, separators and prefix/suffix kept) when it scrolls into view; screen readers get the final value.

```html
<usa-story template="counter">
  <strong data-count="12,480">0</strong> users
  <strong data-count="99.9%">0</strong> uptime
</usa-story>
```

### Story: step highlight

5.4: template="highlight" dims every paragraph except the one crossing the viewport center (pin does the same for [data-step] sections next to a sticky [data-stage]); fires usa:step.

```html
<usa-story template="pin">
  <figure data-stage>…chart…</figure>
  <section data-step>Step 1</section>
  <section data-step>Step 2</section>
</usa-story>
```
