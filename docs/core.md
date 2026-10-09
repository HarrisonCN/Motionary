# `motionary/core` — the 10.0 zero-dependency core

`motionary/core` is the whole runtime of Motionary 10: no dependencies, no side effects, **under 10 KB gzip** (about 2 KB today; a size budget and a test keep it there). Everything else — every effect pack, every GPU background — is a plugin you add with `use()`.

```js
import { createMotion } from 'motionary/core';
import { retro, cinema } from 'motionary/plugins';

const motion = createMotion().use(retro, cinema);

motion.reveal('.card', 'fade-up', { stagger: 80 });          // scroll-in entrances
motion.bind(button, 'vhs-glitch', { trigger: 'click' });     // effect on a trigger
await motion.play(hero, 'dolly-in', { duration: 900 });      // play once, await it
motion.pause(); motion.setRate(0.5); motion.resume();         // one control for everything it started
```

## API

- `createMotion({ reducedMotion?: 'user' | 'reduce', rate?: number })` → instance:
  - `use(...plugins)` — add plugins (`{ name, effects?, install?(motion) }`); a plugin is installed once, the first effect with a name wins.
  - `play(el, effect, options?, event?)` — run an effect, resolves when it finishes; unknown effects throw ("add its plugin with use()").
  - `bind(el, effect, { trigger: 'click' | 'hover' | 'enter' | 'load' | 'loop' | 'manual', once?, ...options })` → `off()`.
  - `reveal(targets, preset = 'fade-up', { stagger, delay, duration, easing, once, threshold })` → `off()`; elements are hidden until they enter the viewport.
  - `animate(el, keyframes, options)` — `el.animate()` tracked by the instance.
  - `pause()`, `resume()`, `setRate(rate)`, `paused`, `rate`, `has(name)`, `effects()`, `reduced()`, `destroy()`.
- `PRESETS` — `fade`, `fade-up`, `fade-down`, `fade-left`, `fade-right`, `scale`, `zoom-in`, `zoom-out`, `blur-in`, `flip-up` (registered as `enter` effects on every instance).
- `preferredBackend()` — `'webgpu'` when `navigator.gpu` exists (the 10.0 default), else `'webgl2'`, else `'canvas'`.
- `VERSION` — `'10.0.0'`.

## Plugins

`motionary/plugins` exports every built-in effect pack as a plugin (`retro`, `cinema`, `paper`, `cyber`, `weather`, … and `ALL_PLUGINS`). Each import pulls in only its own pack. The same plugins work with `usePlugins()` from `motionary/fx2` for the `<usa-*>` elements and `data-usa-fx` attributes.

Your own plugin:

```js
const sparkle = { name: 'acme/sparkle', effects: [{ name: 'sparkle', kind: 'attention', run: (el, o, ctx) => ctx.animate(el, [{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)' }, { filter: 'brightness(1)' }], 400) }] };
createMotion().use(sparkle);
```

## Reduced motion

Honoured everywhere (the OS setting, or `reducedMotion: 'reduce'`): entrance presets fade instead of moving; `loop`, `background` and `cursor` effects are skipped unless the effect says `reduced: 'run'`; effects receive `ctx.reduced` to degrade themselves.

## Upgrading

`registerEffectPacks()` (deprecated in 9.9) is removed — use `registerAllPlugins()` or, better, only the plugins you need. `npx usa-codemod-10 --write src` rewrites it. The full `motionary` package, `motionary/components` and every `<usa-*>` element keep working unchanged. See [upgrading-10.md](./upgrading-10.md).
