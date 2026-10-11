# Motion design tokens

**Motion Tokens 2.0 (14.1)** lives in its own entry, `motionary/tokens` (= `motionary/components/motion-tokens`, own
size budget, not in lite). It covers durations, easing curves, springs, **spatial distances** and **motion semantics**
(`enter` / `exit` / `emphasis` / `transition`) in one token set. A set has **modes**: reduced motion is built in,
`compact` ships by default, and you can add your own. It reads and writes **W3C Design Tokens** (DTCG 2025.10) and
**CSS custom properties**, plugs into **Motion Engine v2** and **Scene Format v2**, and maps to **Figma Variables**
(REST API shapes, with a CLI). It has no dependencies and makes no network calls. The 4.2 / 10.6 API
(`motionary/components/tokens`, [below](#the-42-token-scale-motionarycomponentstokens)) has not changed.

```ts
import { defineMotionTokens, applyMotionTokenSet, motionOptions, motionKeyframes } from 'motionary/tokens';
import { animate } from 'motionary/motion';

const tokens = defineMotionTokens({ duration: { fast: 120 }, distance: { md: 20 } }); // merged over the defaults
applyMotionTokenSet(tokens, { mode: 'auto' }); // CSS vars on <html>; '{duration.fast}' refs; reduced motion when the OS asks
animate('.card', motionKeyframes(tokens, 'enter'), motionOptions(tokens, 'enter'));
animate('.chip', { opacity: [0, 1] }, { duration: '{duration.fast}', easing: '{easing.standard}' });
```

## The token set

| Group | Default | Value |
|---|---|---|
| `duration` | `instant` 0 · `fast` 150 · `normal` 300 · `slow` 600 · `slower` 900 · `slowest` 1400 | ms |
| `easing` | `linear` · `standard` · `emphasized` · `decelerate` · `accelerate` · `spring` · `bounce` | CSS easing (`cubic-bezier()`, keywords, `steps()`, `linear()`) |
| `spring` | `gentle` · `snappy` · `bouncy` · `wobbly` · `stiff` | `{ stiffness, damping, mass }` |
| `distance` | `none` 0 · `xs` 4 · `sm` 8 · `md` 16 · `lg` 32 · `xl` 64 | px: how far things travel |
| `semantic.enter.default` | `{duration.normal}` · `{easing.decelerate}` · `{distance.md}` | |
| `semantic.exit.default` | `{duration.fast}` · `{easing.accelerate}` · `{distance.sm}` | |
| `semantic.emphasis.default` | `{duration.normal}` · `{easing.emphasized}` · `{distance.xs}` · `{spring.bouncy}` | |
| `semantic.transition.default` | `{duration.normal}` · `{easing.standard}` | |

A semantic token is `{ duration, easing?, delay?, distance?, spring? }`. Each field is a literal or a reference to a
primitive, written in DTCG alias syntax (`"{duration.fast}"`). That is the same syntax Motion Engine v2 and Scene
Format v2 accept. Add your own semantic tokens by name (`semantic.enter.hero`); a missing name falls back to `default`.

| Function | |
|---|---|
| `MOTION_TOKENS_2` · `SEMANTIC_KINDS` · `MOTION_TOKENS_VERSION` (2) | The default set and constants. |
| `defineMotionTokens(partial, base?)` | Deep-merge a partial set and `modes` over the defaults. Never mutates. |
| `resolveMotionToken(set, ref, mode?)` | `'{duration.fast}'` → 150, `'{enter.default}'` → `{ duration, delay, easing, distance }`. |
| `resolveSemantic(set, kind, name?, mode?)` | One semantic motion as literals. |
| `motionOptions(set, kind, name?, mode?)` | `{ duration, delay, easing }` for `animate()`. |
| `motionKeyframes(set, kind, name?, { axis, direction, mode })` | Keyframes: enter/exit fade and travel by the token's distance; emphasis nudges out and back. |
| `validateMotionTokens(set)` | A list of problems (empty = valid); never throws. |

## Modes

`withMode(set, mode)` returns the set as seen in one mode, or in several applied in order (`['compact', 'reduced']`).

- **`reduced`** is built in, so every set has it, including sets that declare no modes. It is derived from the set:
  every distance becomes 0, durations are capped at 150 ms, overshooting curves (`spring`, `bounce`) become the standard
  curve, springs are critically damped (no overshoot), and literal semantic distances become 0. Anything you put in
  `modes.reduced` is applied on top. `validateMotionTokens` reports a reduced mode that still moves content.
- **`compact`** ships in the defaults: shorter durations and half distances.
- **Custom modes** are named overrides: `defineMotionTokens({ modes: { cinematic: { duration: { normal: 500 } } } })`.

## W3C Design Tokens (DTCG 2025.10)

`motionTokenSetToDTCG(set, { format?, group?, modes? })` writes:

- durations as `$type: duration` (`{ value, unit: "ms" }`, or `"150ms"` with `format: 'draft'`)
- easings as `$type: cubicBezier`; keywords keep their CSS in `$extensions["org.motionary"].css`, and `steps()` /
  `linear()` become `$type: string`
- distances as `$type: dimension` (`{ value, unit: "px" }`)
- springs in `$extensions["org.motionary"].spring`, because spring is not a DTCG type
- semantic tokens as `$type: transition` with aliases (`"{motion.duration.normal}"`); distance and spring go in the
  token's `$extensions`
- modes in the root `$extensions["org.motionary"].modes`

`motionTokenSetFromDTCG(doc)` reads Motionary exports losslessly (export → import gives an equal set) and any DTCG motion
group: it finds the group anywhere in the file, inherits `$type`, resolves aliases, and converts seconds and rem
(16 px). It throws on broken or circular aliases. The 10.6 functions (`importDesignTokens`, `validateDesignTokens`)
read the 2.0 export too.

## CSS custom properties

`motionTokenSetToCss(set, { selector?, prefix?, modes? })` writes:

```css
:root {
  --usa-duration-fast: 150ms;            /* every primitive … */
  --usa-distance-md: 16px;
  --usa-spring-snappy-stiffness: 300;
  --usa-motion-enter-default-duration: var(--usa-duration-normal); /* semantic vars reference primitives */
  --usa-motion-enter-default-distance: var(--usa-distance-md);
}
@media (prefers-reduced-motion: reduce) { :root { --usa-distance-md: 0px; /* only what changes */ } }
:root[data-usa-motion-mode~="reduced"] { --usa-distance-md: 0px; }
:root[data-usa-motion-mode~="compact"] { --usa-duration-normal: 240ms; /* … */ }
```

An explicit `data-usa-motion-mode` wins over the OS preference. `motionTokenSetVars(set, { prefix, mode })` returns the
map.

## Motion Engine v2 and Scene Format v2

- `applyMotionTokenSet(set, { mode?, root?, prefix? })` makes the set active. It writes every custom property on
  `root` (default `<html>`), and `{duration.*}` / `{easing.*}` / `{spring.*}` references in `motionary/motion`,
  `motionary/motion/scene` and the token-aware components then resolve to it. `mode: 'auto'` follows
  `prefers-reduced-motion` and its changes. Returns an undo function. Since 14.1, `spring(target, '{spring.x}')` in
  `motionary/motion` reads the active set; it used to read only the defaults.
- `toSceneTokens(set, mode?)` returns scene-local `tokens` for a Scene Format v2 document. `withSceneTokens(doc, set, mode?)`
  returns a copy of the document carrying them (the document's own tokens win), so `validateSceneV2` and `playScene`
  know your custom token names.

## Figma Variables

`motionTokensToFigma(set, { collection?, modes?, prefix?, cssPrefix? })` returns the body of the Figma REST API's
`POST /v1/files/:file_key/variables`: one collection (default "Motion"), a Default mode, and one mode per token-set mode
(`reduced` ↔ "Reduced motion", `compact` ↔ "Compact"). Variables are named `motion/<group>/<name>`, the names the 12.3
Figma plugin reads:

- durations and distances: `FLOAT`
- easings: `STRING`
- springs: three `FLOAT`s (`motion/spring/<name>/stiffness|damping|mass`)
- semantic tokens: `motion/<kind>/<name>/<duration|delay|easing|distance>` as `VARIABLE_ALIAS` values of the primitives

Each variable carries `codeSyntax.WEB` = its CSS variable.

`motionTokensFromFigma(json, { collection?, prefix? })` reads a `GET /v1/files/:file_key/variables/local` response, or
such a POST body. The default mode becomes the set, and other modes become token-set modes holding only what differs:
a name containing "reduc" maps to `reduced`, and other names are kebab-cased ("Dense UI" → `dense-ui`). Aliases to
primitives become references, and non-motion variables are ignored. The library never calls the network: send the body
with your own Figma token.

```sh
npx motionary tokens export-figma tokens.json --collection "Brand motion" --modes reduced,compact --out figma.json
curl -X POST -H "X-Figma-Token: $FIGMA_TOKEN" -H "Content-Type: application/json" \
  --data @figma.json https://api.figma.com/v1/files/$FILE_KEY/variables
curl -H "X-Figma-Token: $FIGMA_TOKEN" https://api.figma.com/v1/files/$FILE_KEY/variables/local > local.json
npx motionary tokens import-figma local.json --out tokens.json   # or --css --out motion.css
npx motionary tokens validate tokens.json                          # exit 1 on problems
npx motionary tokens css tokens.json --out motion.css
```

---

## The 4.2 token scale (`motionary/components/tokens`)

`motionary/components/tokens` gives your product one motion scale — durations, easings and springs — as **CSS custom properties**, **W3C Design Tokens JSON**, and **JS values**, and imports the scale your designers keep in **Figma Tokens (Tokens Studio)** or **Style Dictionary**.

```ts
import { applyMotionTokens, importMotionTokens, motionToken, motionVar } from 'motionary/components/tokens';

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

### Default scale

| Group | Tokens |
|---|---|
| `duration` (ms) | `instant` 0 · `fast` 150 · `normal` 300 · `slow` 600 · `slower` 900 · `slowest` 1400 |
| `easing` | `linear` · `standard` · `emphasized` · `decelerate` · `accelerate` · `spring` · `bounce` |
| `spring` (stiffness / damping / mass) | `gentle` 120/14/1 · `snappy` 300/30/1 · `bouncy` 260/12/1 · `wobbly` 180/8/1 · `stiff` 500/40/1 |

Prebuilt files: [`docs/motion-tokens.css`](./motion-tokens.css) and [`docs/motion.tokens.json`](./motion.tokens.json) (DTCG; `$type: duration | cubicBezier | spring`).

### API

| Function | |
|---|---|
| `MOTION_TOKENS` | The default scale. |
| `applyMotionTokens(partial?, root?, prefix?)` | Merge over the defaults, write `--usa-*` vars on `root` (default `<html>`), make it the active scale. Returns undo. |
| `importMotionTokens(json, base?)` | DTCG (`$value`/`$type`), Tokens Studio (`value`/`type`), Style Dictionary (`value`, nested). Reads leaves under any `duration` / `easing` / `spring` group (any depth) and typed leaves (`duration`, `cubicBezier`, `transition`, `spring`). |
| `motionTokensToCss(tokens?, selector?, prefix?)` · `motionTokensToVars()` · `motionTokensToJSON()` | Export. |
| `motionToken(group, name)` · `motionVar(group, name, prop?)` · `getMotionTokens()` | Read. |
| `parseDuration()` · `parseEasing()` · `mergeMotionTokens()` · `resolveDurationToken()` · `resolveEasingToken()` | Helpers. |

### Style Dictionary

Point Style Dictionary at `docs/motion.tokens.json` as a source, or export your own motion group and import it at runtime with `importMotionTokens()`. Tokens are plain data, so SSR is fine; `applyMotionTokens()` is a no-op without a DOM (it still sets the active scale).

### From Figma (12.3)

The Figma plugin ([figma-plugin/README.md](../figma-plugin/README.md)) reads variables named `motion/duration/<name>` and `motion/easing/<name>` and exports them in this format (and as CSS), merged over these defaults.
