# Upgrading to 4.0

4.0 removes the three APIs that 3.9 deprecated, each replaced by a more capable one added during 3.x. **Run your app on 3.9 first**: it logs one console warning (`[use-scroll-animate] … deprecated …`) for every removed API you still use.

| Removed in 4.0 | Use instead | Since |
|---|---|---|
| `sequence(steps, opts)` (`use-scroll-animate`) | `timeline()` — `use-scroll-animate` (re-exported in 4.0) or `use-scroll-animate/components/timeline` | 3.1 |
| `connectedAnimation(from, to)` (`components/transitions`) | `sharedTransition(update)` with `data-shared="id"` (`components/layout`) | 3.6 |
| `<usa-flip-list>` / `defineFlipList()` (`components/transitions`) | `<usa-auto-animate>` / `autoAnimate(el)` (`components/layout`) | 3.6 |

## `sequence()` → `timeline()`

```js
// 3.x
sequence([
  { target: '.title', animation: 'fade-in-up' },
  { target: '.subtitle', animation: 'blur-in', gap: -300 },
  { target: '.card', animation: 'scale-up', stagger: 80 },
], { trigger: '.hero' });

// 4.0
import { timeline } from 'use-scroll-animate';
const tl = timeline({ defaults: { duration: 600 } })
  .to('.title', 'fade-up')
  .to('.subtitle', 'blur', { at: '-=300' })   // gap: -300  →  at: '-=300'
  .to('.card', 'scale', { stagger: 80 });
// trigger: '.hero'  →  play when it enters the view (or scrub it with scroll)
new IntersectionObserver(([e], io) => e.isIntersecting && (io.disconnect(), tl.play())).observe(document.querySelector('.hero'));
```

Declaratively: wrap the section in `<usa-timeline>` and mark steps with `data-tl="fade-up"`, `data-at="-=300"`.

`gap: n` → `at: '+=n'` (negative → `'-=n'`), `at: ms` stays `at: ms`. Engine presets map to timeline presets: `fade-in-up` → `fade-up`, `blur-in` → `blur`, `scale-up` → `scale`, or pass keyframes.

## `connectedAnimation()` → `sharedTransition()`

```js
// 3.x
detail.hidden = false;
connectedAnimation(thumbnail, detail);

// 4.0 — give both ends the same data-shared id
// <img data-shared="photo-7"> in the grid and in the detail view
import { sharedTransition } from 'use-scroll-animate/components/layout';
await sharedTransition(() => { grid.hidden = true; detail.hidden = false; });
```

Uses the View Transitions API where available (FLIP fallback elsewhere) and morphs any number of shared elements at once.

## `<usa-flip-list>` → `<usa-auto-animate>`

```html
<!-- 3.x -->
<usa-flip-list><li>…</li></usa-flip-list>
<!-- 4.0 -->
<usa-auto-animate><li>…</li></usa-auto-animate>
```

`<usa-auto-animate>` also animates additions and removals, and size changes. Imperatively: `autoAnimate(ul)`.

## Other changes in 4.0

- `timeline` is exported from the root entry (`import { timeline } from 'use-scroll-animate'`) in addition to `components/timeline`.
- CDN snippets in docs and the showcase use `use-scroll-animate@4`.
- npm `latest` moves to 4.0.0. 3.x stays available as `use-scroll-animate@3`.
