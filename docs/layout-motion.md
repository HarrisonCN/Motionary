# Layout Motion 2.0 (14.2)

`motionary/motion/layout` (= `motionary/components/motion-layout`) animates **layout changes**: an element moves or
resizes because the DOM or CSS changed, and instead of jumping it glides from its old box to its new one. It covers
FLIP with transforms, scale correction, layout groups, interruption, shared elements (`layoutId`) between states and
routes, and the View Transitions API with an automatic FLIP fallback. It is built on [Motion Engine v2](./motion-engine-v2.md),
so every layout animation is a standard `MotionControls` (`play` · `pause` · `seek` · `reverse` · `finish` · `cancel` ·
`finished`).

It is its own entry (≈ 6.5 KB gzip, budget 8 KB). It is not part of `motionary/motion` or `motionary/components/lite`,
and it has no dependencies. The 13.x layout API (`motionary/components/layout`: `autoAnimate`, `sharedTransition`,
`flipFrames`, `<usa-auto-animate>`) is unchanged.

```ts
import { flip, layoutGroup, setLayoutId, sharedLayout, layoutTransition } from 'motionary/motion/layout';
```

## FLIP: `flip(targets, update, options?)`

```ts
const controls = flip('.card', () => grid.classList.toggle('dense'), { duration: '{duration.normal}' });
await controls.finished;
```

`flip()` measures `targets` (a selector, an element or a list), runs `update()` (a synchronous DOM change), measures
again, and shows each element at its old box with `translate3d(x, y, 0) scale(sx, sy)` (transform-origin `0 0`). That
transform then eases to none. Elements that did not move get no animation. When it finishes or is cancelled, the
element's inline `transform`, `transform-origin`, `border-radius`, `opacity` and `visibility` are put back as they were.
While a layout animation runs, it owns the element's inline `transform`. Wrap the element if it needs its own transform.

| Option | Default | |
| --- | --- | --- |
| `duration` | `300` | ms or a duration token (`'{duration.fast}'`, `'fast'`) |
| `delay` | `0` | ms |
| `easing` | `cubic-bezier(0.22, 1, 0.36, 1)` | CSS easing, easing token or a function of 0–1 |
| `scale` | `true` | animate size changes as scale; `false` = position only |
| `correct` | `true` | counter-scale the direct children of a scaling element; a selector = matching descendants; `false` = none |
| `radius` | `true` | correct `border-radius` for the current scale |
| `reducedMotion` | `'instant'` | see [Reduced motion](#reduced-motion) |
| `autoplay`, `playbackRate`, `onUpdate`, `onComplete` | | as in Motion Engine v2 |

### Scale correction

Scaling a box also stretches its contents and its corners. While a parent scales, Layout Motion 2.0 gives each direct
child the inverse transform, so text and images keep their size and stay put relative to the parent's corner. It also
rewrites `border-radius` each frame as `rx/sx px / ry/sy px`, so a 12 px corner stays 12 px. When the old and new
radius differ (for example a shared element going from a round thumbnail to a square card), the radius is interpolated
too. Pass `correct: '.label, img'` to correct deeper descendants, or `correct: false` to let children scale.

**Nested layout elements:** when both a parent and its child are in the same `flip()`, the child is animated in the
parent's frame, so the transforms are not applied twice.

### Interruptible animations

A new `flip()` (or `sharedLayout`, `layoutGroup().flip`, `snapshotLayout`) on an element that is still animating starts
from where the element is **now**, not from its old layout box. The earlier animation is dropped for that element (its
`MotionControls` goes `idle` once it has nothing left to animate), so rapid toggles never jump. `isLayoutAnimating(el)`
tells whether one is running.

### Measure and play separately: `snapshotLayout()`

```ts
const snap = snapshotLayout(items); // before the change
render();                           // any way you like
snap.animate({ duration: 250 });    // after it
```

`measureLayout(el)` returns the scroll-independent box that `flip()` uses.

## Layout groups: `layoutGroup(members, options?)`

When one item in an accordion opens, its siblings move too. A group animates all members together:

```ts
const g = layoutGroup('.accordion > section');   // selector members are re-queried each time
g.flip(() => item.classList.toggle('open'));
g.add(extraEl).remove(oldEl);
const cards = layoutGroup('#grid > .card', { id: 'grid' }); // id = namespace for layoutIds
setLayoutId(card, 'p1', cards);                  // data-layout-id="grid/p1"
await cards.shared(() => openDetail(card));      // shared transition limited to "grid/…"
```

## Shared element transitions (`layoutId`)

Give "the same thing" in two states the same layoutId: `setLayoutId(el, 'photo-1')`, or `data-layout-id="photo-1"` in
markup (the 13.x `data-shared` is read too). `getLayoutId(el)` reads it, and `setLayoutId(el, null)` removes it.

```ts
const controls = await sharedLayout(async () => {
  await router.push('/photo/1'); // sync or async (route changes)
}, { duration: 400 });
```

`sharedLayout(update, options?)` records every layoutId's box, runs `update()`, and then:

- the element that now has a layoutId flies from the old element's box: position, size and radius, with scale and
  radius correction;
- if the old element is still in the DOM, it is hidden while the new one flies (`visibility: hidden`). With
  `crossfade: true`, both fly: the old one fades out and the new one fades in;
- elements whose layoutId exists only after the update fade in (`enter: 'none'` turns that off);
- `root` limits the search, and `scope` limits it to ids with a prefix (layout groups set it).

## View Transitions: `layoutTransition(update, options?)`

```ts
const t = await layoutTransition(() => router.go('/photo/1'), { types: ['forward'] });
t.method;        // 'view-transition' | 'flip' | 'instant' | 'crossfade'
await t.finished;
```

- **Same-document View Transitions** where `document.startViewTransition` exists. Each layoutId becomes a
  `view-transition-name` (`mo-<id>`, unsafe characters as `_`, see `viewTransitionName()`) on the old elements before
  the snapshot and on the new elements after `update()`. All names are removed afterwards. Duration, delay and easing
  apply to `::view-transition-group(*)`, `-old(*)` and `-new(*)` through a temporary `<style data-motionary-vt>`.
  `types` are passed when the browser supports them, and ignored when it does not.
- **Automatic FLIP fallback** when the API is missing, when `startViewTransition` throws, or with `method: 'flip'`. It is
  `sharedLayout()` with the same options, and the DOM it ends with is the same (parity is tested in Chromium,
  Firefox and WebKit).
- **Interruption:** starting a transition skips the one still running (`skipTransition()`), or finishes it on the FLIP
  path.
- Resolves once the DOM is updated; `finished` never rejects; `skip()` jumps to the end; `controls` is the FLIP
  controller.

`supportsViewTransitions()` and `supportsCrossDocumentViewTransitions()` report what the browser can do.

### Cross-document (MPA): `crossDocumentLayout(options?)`

Call it on both pages, early (in a render-blocking script, so `pagereveal` is caught):

```ts
const undo = crossDocumentLayout(); // method: 'auto' | 'view-transition' | 'flip'
```

- Where cross-document view transitions are supported, it adds `@view-transition { navigation: auto; }` (plus the
  timing) and names layoutIds on `pageswap` (old page) and `pagereveal` (new page). Navigations between same-origin
  pages then animate the shared elements natively.
- Elsewhere it uses a **FLIP fallback**: on `pagehide` it saves every layoutId's viewport box to `sessionStorage`
  (`saveLayoutSnapshot()`). When the next page loads, it flies the matching elements from those boxes once
  (`playLayoutSnapshot()`). Snapshots older than `maxAge` (5 s) are ignored.

## Reduced motion

Under `prefers-reduced-motion: reduce` (or `configureComponents({ reducedMotion: 'reduce' })` / a minimal motion
sensitivity):

| `reducedMotion` | `flip` / `sharedLayout` | `layoutTransition` |
| --- | --- | --- |
| `'instant'` (default; `'respect'` is the same) | the change applies at once (`playState: 'finished'`) | `update()` only, no view transition (`method: 'instant'`) |
| `'crossfade'` | no movement: changed elements fade in | a view transition with no shared names, which is only the root cross-fade; without the API, the FLIP cross-fade (`method: 'crossfade'`) |
| `'ignore'` | animates anyway | animates anyway |

## Correct under scroll containers, transforms and sticky

- **Scroll containers and the window:** boxes are measured as the viewport rect plus the scroll offsets of every
  scrolling ancestor and the window. So an update that scrolls a container, or the page, is not taken for a layout
  change, and a real move inside a scrolled container animates only by the layout delta.
- **`position: sticky` / `fixed`:** an element that is, or sits inside, a sticky or fixed box is measured in viewport
  space. Scroll offsets above the sticky or fixed ancestor do not count, because scrolling is part of how it looks,
  not a layout change.
- **Ancestor transforms:** under a scaled ancestor (zoomed canvas, scaled card), translate deltas are converted into
  the element's local px (rendered size ÷ layout size of the parent), so the element still lands exactly on its box.
- Elements with `display: none` (no box) after the update are skipped.

## Frameworks: `createLayoutTracker(targets, options?)`

The adapters (`motionary/components/react`, `vue`, `svelte`, `solid`, `angular`) are unchanged. Layout Motion works
with each framework's own lifecycle through one framework-neutral helper: `snapshot()` before the framework writes the
DOM, `animate()` after.

```ts
const tracker = createLayoutTracker(() => listEl.children, { duration: 250 });
tracker.snapshot();   // before the update
// … the framework commits …
tracker.animate();    // after it → MotionControls | null
tracker.cancel();     // on unmount
```

**React**

```tsx
const ref = useRef<HTMLUListElement>(null);
const tracker = useMemo(() => createLayoutTracker(() => ref.current!.children), []);
const sort = () => { tracker.snapshot(); setItems((xs) => [...xs].reverse()); };
useLayoutEffect(() => { tracker.animate(); }, [items]);
useEffect(() => () => tracker.cancel(), []);
```

**Vue**

```ts
const list = ref<HTMLElement>();
const tracker = createLayoutTracker(() => list.value!.children);
onBeforeUpdate(() => tracker.snapshot());
onUpdated(() => tracker.animate());
onBeforeUnmount(() => tracker.cancel());
```

**Svelte** (5)

```svelte
<script>
  import { createLayoutTracker } from 'motionary/motion/layout';
  let list; let items = $state([1, 2, 3]);
  const tracker = createLayoutTracker(() => list.children);
  $effect.pre(() => { items; tracker.snapshot(); });
  $effect(() => { items; tracker.animate(); });
</script>
```

**Solid**

```tsx
let list!: HTMLUListElement;
const tracker = createLayoutTracker(() => list.children);
const reorder = () => { tracker.snapshot(); setItems((xs) => [...xs].reverse()); queueMicrotask(() => tracker.animate()); };
onCleanup(() => tracker.cancel());
```

**Angular**

```ts
private tracker = createLayoutTracker(() => this.list.nativeElement.children);
private injector = inject(Injector);
reorder() {
  this.tracker.snapshot();
  this.items.reverse();
  afterNextRender(() => this.tracker.animate(), { injector: this.injector });
}
ngOnDestroy() { this.tracker.cancel(); }
```

For route changes in any framework, wrap the navigation in `layoutTransition(() => router.push(url))`. The layoutIds
on both routes are paired automatically.

## Pure helpers

`layoutDelta(from, to, ancestorScale?)`, `mixBox(a, b, p)`, `solveLayoutTransform(want, to, parent?, ancestorScale?)`,
`layoutTransform(delta)` and `correctRadius(r, sx, sy)` are the math behind all of the above. They are exported for
custom renderers (canvas, WebGL) and for tests.

## Tests

- `test/layout-motion-2-14-2.test.ts` (jsdom, with a small fake layout engine) covers the math, FLIP, correction,
  interruption, scroll, sticky and transforms, groups, layoutId, View Transitions on and off, reduced motion,
  cross-document and the tracker.
- `test/browser/layout-motion.spec.mjs` runs in Chromium, Firefox and WebKit. It measures real element rects
  mid-transition, checks scale correction and scroll-container correctness, checks parity between the View
  Transitions and FLIP paths (including the API forced off), and checks reduced motion.
