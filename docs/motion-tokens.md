# Motion design tokens (4.2)

`use-scroll-animate/components/tokens` gives your product one motion scale — durations, easings and springs — as **CSS custom properties**, **W3C Design Tokens JSON**, and **JS values**, and imports the scale your designers keep in **Figma Tokens (Tokens Studio)** or **Style Dictionary**.

```ts
import { applyMotionTokens, importMotionTokens, motionToken, motionVar } from 'use-scroll-animate/components/tokens';

// 1. Use the defaults (writes --usa-* variables on <html>)…
applyMotionTokens();
// 2. …or your own scale, from a Figma Tokens / Style Dictionary / DTCG export
applyMotionTokens(importMotionTokens(await (await fetch('/design/tokens.json')).json()));

motionToken('duration', 'fast');      // 150
motionToken('easing', 'emphasized');  // 'cubic-bezier(0.22, 1, 0.36, 1)'
motionVar('duration', 'slow');        // 'var(--usa-duration-slow, 600ms)'
timeline().to('.card', 'fade-up', { duration: 'slow', easing: 'spring' }); // token names work
```

```css
.button { transition: transform var(--usa-duration-fast) var(--usa-easing-emphasized); }
```

## Default scale

| Group | Tokens |
|---|---|
| `duration` (ms) | `instant` 0 · `fast` 150 · `normal` 300 · `slow` 600 · `slower` 900 · `slowest` 1400 |
| `easing` | `linear` · `standard` · `emphasized` · `decelerate` · `accelerate` · `spring` · `bounce` |
| `spring` (stiffness / damping / mass) | `gentle` 120/14/1 · `snappy` 300/30/1 · `bouncy` 260/12/1 · `wobbly` 180/8/1 · `stiff` 500/40/1 |

Prebuilt files: [`docs/motion-tokens.css`](./motion-tokens.css) and [`docs/motion.tokens.json`](./motion.tokens.json) (DTCG; `$type: duration | cubicBezier | spring`).

## API

| Function | |
|---|---|
| `MOTION_TOKENS` | The default scale. |
| `applyMotionTokens(partial?, root?, prefix?)` | Merge over the defaults, write `--usa-*` vars on `root` (default `<html>`), make it the active scale. Returns undo. |
| `importMotionTokens(json, base?)` | DTCG (`$value`/`$type`), Tokens Studio (`value`/`type`), Style Dictionary (`value`, nested). Reads leaves under any `duration` / `easing` / `spring` group (any depth) and typed leaves (`duration`, `cubicBezier`, `transition`, `spring`). |
| `motionTokensToCss(tokens?, selector?, prefix?)` · `motionTokensToVars()` · `motionTokensToJSON()` | Export. |
| `motionToken(group, name)` · `motionVar(group, name, prop?)` · `getMotionTokens()` | Read. |
| `parseDuration()` · `parseEasing()` · `mergeMotionTokens()` · `resolveDurationToken()` · `resolveEasingToken()` | Helpers. |

## Style Dictionary

Point Style Dictionary at `docs/motion.tokens.json` as a source, or export your own motion group and import it at runtime with `importMotionTokens()`. Tokens are plain data, so SSR is fine; `applyMotionTokens()` is a no-op without a DOM (it still sets the active scale).
