# Migrating to Motionary 14

14.0 introduces **Motion Engine v2** (`motionary/motion`) and makes **Scene Format v2** the official motion document
(`motionary/scene`). It removes four interfaces deprecated in 13.9 from the main entries, and keeps every one of them
behind the compat entry **`motionary/compat-v13`**, so you can upgrade first and migrate later.

What does **not** change: `<usa-*>` tags, attributes, events (`usa:*`), presets, motion tokens and the runtime; the
Timeline document v1 API; zero runtime dependencies; the lite budget (`motionary/components/lite` ≤ 70 KB gzip, not
raised). Nothing renders differently.

## 1. Upgrade

```sh
npm i motionary@14            # or: npm i motionary@latest
npx motionary doctor          # old import paths + legacy event names (since 11.5)
npx motionary migrate --code  # dry run: the 14.0 import moves in your source (add --write to apply)
```

CDN URLs pin a major: move them from major 13 to `motionary@14/…` (`migrate --code` does it). 13.x stays installable
as `npm i motionary@v13-lts` (13.9.0), and the CDN major 13 keeps serving 13.9.0.

## 2. What was removed, and the one-line way to keep it

| 13.x | 14.0 | Keep it for now | Move off it |
|---|---|---|---|
| `use-scroll-animate/playground` documents in `<usa-player>` / `createPlayer()` | throws (sets `data-error` on `<usa-player>`) | `installCompatV13()` from `motionary/compat-v13` | `npx motionary migrate hero.json --write` (scene v2) |
| animation JSON without `format` / `version` | throws | `installCompatV13()` | add `"format": "use-scroll-animate/animation", "version": 1`, or migrate to scene v2 |
| `normalizeAnimation()` from `motionary/components/effects` | not exported | `import { normalizeAnimation } from 'motionary/compat-v13'` | `validateSceneV2()` / `migrateToSceneV2()` from `motionary/scene` |
| `usa-codemod-5` … `usa-codemod-10` bins | not in the package `bin` | `npx motionary codemod <5–10> [--write] [paths…]` | — (they upgrade 4.x–9.x code) |

```ts
// once, before any <usa-player> loads a legacy document
import { installCompatV13 } from 'motionary/compat-v13';
installCompatV13(); // returns an uninstall function
```

`motionary/compat-v13` is its own entry: nothing in `motionary`, `motionary/core`, `motionary/components` or lite imports
it. In development it logs one notice per removed interface you still use (production builds drop the notices;
`globalThis.MOTIONARY_NO_DEPRECATION = true` silences them). It is planned for removal in 15.0. Every removed interface, its replacement and its migration path: [deprecations-v14.md](./deprecations-v14.md).

## 3. `npx motionary migrate --code`

Rewrites source files (`.js`, `.ts`, `.tsx`, `.vue`, `.svelte`, `.html`, `.md`, `.json`, …; `node_modules` / `dist` skipped):

| Before | After |
|---|---|
| `import { normalizeAnimation, createPlayer } from 'motionary/components/effects'` | `import { createPlayer } from 'motionary/components/effects'` + `import { normalizeAnimation } from 'motionary/compat-v13'` |
| `'motionary/components/scene-v2'` (import, require, dynamic import) | `'motionary/scene'` (the old path still works; it is an alias) |
| `usa-codemod-7 --write` in scripts | `motionary codemod 7 --write` |
| CDN URLs pinned to major 10–13 | `motionary@14/…` |

The same rules apply to `use-scroll-animate/…` paths. Dry run by default; `--write` applies; `--json` for tooling.
Running it twice changes nothing. There are no renamed functions in 14.0, so nothing else needs rewriting.

## 4. Motion data: Scene Format v2

```sh
npx motionary migrate src/motion/*.json --diff     # look first (dry run)
npx motionary migrate src/motion/*.json --write    # write <name>.scene.json files
```

You do not have to convert anything to keep playing: `<usa-player>` reads scene v2 natively and
`motionary-timeline` v1 through auto-migration, and animation JSON v1 with `format` / `version` as before. The Timeline
editor (`motionary/components/timeline-editor`) writes scene v2 with `timelineDocToScene()` and opens any motion
document with `loadMotionDoc()`. Format and API: [scene-v2.md](./scene-v2.md).

## 5. New: Motion Engine v2

One composable API with one controller interface:

```ts
import { animate, sequence, parallel, stagger, spring, timeline } from 'motionary/motion';
import { playScene } from 'motionary/motion/scene'; // scene v2 → one controller (own entry)

const intro = sequence([
  animate('.title', 'fade-up', { duration: '{duration.slow}' }),
  parallel([stagger('.card', 'scale', { each: 60 }), spring('.cta', 'scale', 'bouncy')]),
]);
intro.pause(); intro.seek(400); intro.reverse(); await intro.finished; intro.cancel();
```

`animate`, `sequence`, `parallel`, `stagger`, `spring`, `timeline` and `playScene` all return the same controls:
`play()`, `pause()`, `seek(ms)`, `reverse()`, `finish()`, `cancel()`, `finished` (a promise; rejects with an
`AbortError` on cancel), `currentTime`, `progress`, `duration`, `playbackRate`, `playState`. Compositions nest. The
engine runs on the shared frame scheduler and motion clock (pausing `motionClock` pauses it) and reuses the timeline
runtime's position grammar (`'>'`, `'<'`, `'+=200'`, `'-=100'`, `'label+=80'`), presets and motion tokens. Reduced
motion jumps to the end unless `reducedMotion: 'ignore'`. It is an opt-in entry with its own size budget — not in lite.
The 3.1 `timeline()` from `motionary` and the 8.0 `createTimeline()` from `motionary/engine` keep working unchanged.

Details: [motion-engine-v2.md](./motion-engine-v2.md).
