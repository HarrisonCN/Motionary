# `<usa-button>` — Button deformation

> Generated from the source and the gallery catalog by `scripts/gen-component-docs.mjs` (same data as [components.json](https://harrisoncn.github.io/Motionary/components.json) and [llms-full.txt](https://harrisoncn.github.io/Motionary/llms-full.txt)).

Spring-driven button click deformation: squash & stretch, elastic border-radius wobble, gooey liquid droplets, and a dent toward the pressed point. Combine them with deform="squash wobble".

- **Category:** click · **since** 2.5
- **Import:** `import { defineButton } from 'motionary/components/click'` then `defineButton();`
- **CDN:** `<script src="https://unpkg.com/motionary@13/dist/components.umd.js"></script>`
- **Attributes:** `deform`, `state`, `shape`, `disabled`, `morph`, `haptic`, `reset`
- **Events:** `usa:submit`, `usa:state`
- **Slots:** —
- **Methods:** `morphTo()`
- **Source:** [src/components/click/button.ts](../../src/components/click/button.ts)

## Minimal example

```html
<usa-button deform="squash">
  <button>Squash</button>
</usa-button>
<usa-button deform="gooey"><button>Gooey</button></usa-button>
<usa-button deform="dent"><button>Dent</button></usa-button>
```

## ES module

```js
import { defineButton } from 'motionary/components/click';

defineButton(); // registers <usa-button>

/* then use it in your HTML:
<usa-button deform="squash">
  <button>Squash</button>
</usa-button>
<usa-button deform="gooey"><button>Gooey</button></usa-button>
<usa-button deform="dent"><button>Dent</button></usa-button>
*/
```

## Variants

### Button deformation

Spring-driven button click deformation: squash & stretch, elastic border-radius wobble, gooey liquid droplets, and a dent toward the pressed point. Combine them with deform="squash wobble".

```html
<usa-button deform="squash">
  <button>Squash</button>
</usa-button>
<usa-button deform="gooey"><button>Gooey</button></usa-button>
<usa-button deform="dent"><button>Dent</button></usa-button>
```

### Shape morph

The button morphs between pill, circle and icon-only with a spring — label and icon cross-fade. Click to cycle.

```html
<usa-button shape="pill">
  <button><span data-icon>＋</span> <span data-label>New file</span></button>
</usa-button>
<script>btn.morphTo('icon');</script>
```

### Submit → loading → success

morph="submit": click shrinks the button into a spinner (aria-busy), then a drawn check (or a shake + cross on error) and back. Call event.detail.done(ok) from usa:submit.

```html
<usa-button morph="submit" deform="squash">
  <button>Pay $20</button>
</usa-button>
<script>
  btn.addEventListener('usa:submit', async (e) => e.detail.done(await pay()));
</script>
```
