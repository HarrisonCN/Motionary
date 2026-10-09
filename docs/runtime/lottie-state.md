# motionary/runtime/lottie-state — dotLottie themes + state machines

> Generated from `showcase/catalog/prereqs.js` by `scripts/gen-runtime-docs.mjs` — edit the data, not this page.

Resolves Lottie slots with dotLottie themes (Color / Scalar / Vector / Text rules, static or keyframed) and runs a subset of dotLottie state machines (playback states, Event / Numeric / String / Boolean guards, pointer + completion interactions, input / theme / frame actions) for motionary/runtime/vector — own implementation, used by <usa-dotlottie>.

**Runtime tier:** standard — see [runtime tiers](../runtime-tiers.md).

Part of Motionary's own zero-dependency runtime. Size budget: **3.5 KB gzip** (enforced in CI).

## Prerequisites

1. **Install:** `npm i motionary`
2. **Import path:** `motionary/runtime/lottie-state`
3. **CDN:**

```html
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/lottie-state.iife.js"></script>
```

   ESM from a CDN: `https://cdn.jsdelivr.net/npm/motionary@11/dist/runtime/lottie-state.js`

4. **Import order & registration:** Register the core first, then the module: use(lottieState) also registers the core. CDN: load runtime.iife.js, then runtime/lottie-state.iife.js (it registers itself).

```js
import { use } from 'motionary/runtime';
import { lottieState } from 'motionary/runtime/lottie-state';
use(lottieState);
```

## Example

```js
import { use } from 'motionary/runtime';
import { vector, loadLottie } from 'motionary/runtime/vector';
import { lottieState, applyTheme, createStateMachine } from 'motionary/runtime/lottie-state';
use(vector, lottieState);
const { animation, dotLottie } = await loadLottie('/anim/button.lottie');
const themed = applyTheme(animation, dotLottie.themes.dark);
const sm = createStateMachine(dotLottie.stateMachines.toggle, { onState: (s) => console.log(s.name) });
sm.fire('tap');
```

## Exports

`lottieState` · `applyTheme` · `ruleProp` · `createStateMachine` · `inspectStateMachine` · `compare`

## Compatibility

| Feature | Supported | Notes |
|---|---|---|
| themes: slots ("sid") + the animation’s default slot values | ✅ yes |  |
| theme rules: Color, Scalar, Vector / Position, Text; static value or keyframes; per-animation rules | ✅ yes | Image rules are ignored |
| state machines: initial state, PlaybackState (animation, autoplay, loop, speed, mode, marker segment), GlobalState transitions | ✅ yes | subset |
| guards: Numeric / String / Boolean (Equal, NotEqual, GreaterThan(OrEqual), LessThan(OrEqual)), Event | ✅ yes |  |
| interactions: PointerDown / Up / Enter / Exit, Click, OnComplete (+ keyboard Enter / Space in <usa-dotlottie>) | ✅ yes | layerName hit-testing is not done: layer-bound interactions fire for the whole canvas |
| actions: Fire, Set*, Toggle, Increment, Decrement, Reset, SetTheme, SetFrame, SetProgress, FireCustomEvent | ✅ yes |  |
| OpenUrl, blend / tweened transitions, pointer position inputs | ✕ no | OpenUrl is refused on purpose (a file must not navigate the page); listed by inspectStateMachine() |
| SSR / workers | ✅ yes | pure data + logic |

## Components that need it

- `<usa-dotlottie>` — Interactive dotLottie (themes + state machine)
