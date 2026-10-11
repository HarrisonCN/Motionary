# Motion Engine v2 (`motionary/motion`, 14.0)

One composable animation API with **one controller interface**. Opt-in entry (`motionary/motion` =
`motionary/components/motion`) with its own size budget; it is not part of `motionary/components/lite`. Zero
dependencies.

```ts
import { animate, sequence, parallel, stagger, spring, timeline } from 'motionary/motion';
import { playScene } from 'motionary/motion/scene'; // own entry: adds the scene v2 loader
```

`motionary/motion` stays ≤ 5 KB gzip; `playScene` lives in `motionary/motion/scene` (=
`motionary/components/motion-scene`, its own ≤ 5.5 KB budget) because it carries the scene loader `<usa-player>` uses.

## Building blocks

| Function | What it does |
|---|---|
| `animate(target, keyframes, options?)` | Elements (selector, `Element`, list) with WAAPI keyframes, property-indexed keyframes or a preset name (`'fade-up'`); a plain object (numeric props: `animate(obj, { x: 100 })`); or a callback `animate((p) => …, options)` |
| `sequence(children, { gap? })` | children one after another (`gap` ms between; negative overlaps) |
| `parallel(children)` | children together; duration = the longest |
| `stagger(targets, keyframes, { each?, from? })` | one animation per element, starts `each` ms apart (`from`: `'first'`, `'last'`, `'center'` or an index). `stagger(controls[], { each })` offsets existing controllers |
| `spring(target, keyframes, spring?, options?)` | duration and easing from spring physics: `'bouncy'` (preset), `{ stiffness, damping, mass, velocity }` or a token `'{spring.snappy}'`. Overshoots (CSS `linear()` easing where supported) |
| `timeline(entries?, options?)` | children on one playhead: `.add(child, position)`, `.label(name, position)`; positions `1200`, `'>'`, `'<'`, `'+=200'`, `'-=100'`, `'label+=80'` (the 3.1 timeline grammar) |
| `playScene(root, scene, { onEffect? })` (from `motionary/motion/scene`) | plays a Scene Format v2 document (or timeline v1 / animation JSON v1) inside `root`, with the same loader as `<usa-player>` |

Options for leaves: `duration` (ms or a token: `'{duration.fast}'`, `'fast'`), `delay`, `endDelay`, `easing` (CSS
string, `'{easing.standard}'`, or a function of 0–1; default `ease` for elements, `linear` for objects and callbacks),
`repeat` (`Infinity` allowed, but such a motion cannot be composed), `alternate`. For every function: `autoplay`
(default `true`), `playbackRate`, `reducedMotion` (`'respect'` default / `'ignore'`), `onUpdate(progress)`,
`onComplete()`.

## The controller

Every function returns `MotionControls`:

| Member | |
|---|---|
| `play()`, `pause()` | start / hold; `play()` after the end restarts |
| `seek(ms)` | jump and render (clamped to 0–duration); `currentTime` and `progress` are settable too |
| `reverse()` | flip direction and play (from the end when idle at 0) |
| `finish()` | jump to the end (0 when reversed) and resolve `finished` |
| `cancel()` | stop, remove every effect it applied, reject `finished` with an `AbortError` |
| `finished` | promise resolved with the controls at the end; a new one after each restart |
| `duration`, `currentTime`, `progress`, `playbackRate`, `playState` | `'idle' \| 'running' \| 'paused' \| 'finished'` |

A controller passed into `sequence` / `parallel` / `stagger` / `timeline` is **adopted**: it stops running on its own
and the composition drives it. Compositions are controllers too, so they nest.

## How it runs

- Time advances on the shared frame scheduler (`onFrame`, 13.4) with the 8.0 motion clock's scaled `dt`: pausing or
  slowing `motionClock` pauses or slows every engine animation; there is no separate requestAnimationFrame loop.
- DOM leaves are paused WAAPI animations (`fill: 'forwards'`) whose `currentTime` the controller sets; before a
  child's start it has no effect, after its end it holds. Without WAAPI (old WebViews, jsdom) the frame at the
  playhead is applied. Children render in start order, so the later-starting child wins on a shared property.
- `prefers-reduced-motion: reduce`: `play()` jumps to the end state (unless `reducedMotion: 'ignore'`).
- Built from existing parts: the timeline runtime's `resolvePosition` and presets, motion tokens, the 2.3 spring
  solver, the scene loader shared with `<usa-player>`.

## Relation to the older APIs

`timeline()` from `motionary` (3.1), `createTimeline()` / `motionClock` from `motionary/engine` (8.0) and
`spring()` from `motionary/components/physics` keep working unchanged. Motion Engine v2 is the recommended API for new
code; nothing is deprecated in 14.0.
