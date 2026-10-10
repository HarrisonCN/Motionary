# Upgrading to Motionary 12

12.0 makes every `<usa-*>` element follow one contract ([component-contract.md](./component-contract.md)) and turns the
contract test into a blocking check. Most apps need no change; run the two tools first:

```bash
npx motionary doctor            # lists legacy event names (removed in 12.0) and old import paths (removed in 13.0)
npx usa-codemod-12 --write src  # rewrites both
```

## Breaking in 12.0

| What | 11.x | 12.0 |
|---|---|---|
| `<usa-audio>` events | `usa-beat`, `usa-audio-error` (+ `usa:beat`, `usa:audio-error` since 11.8) | `usa:beat`, `usa:audio-error` only |
| `<usa-player>` events | `usa-player-ready`, `usa-player-finish` (+ `usa:ready`, `usa:finish` since 11.8) | `usa:ready`, `usa:finish` only |
| `<usa-story>` events | `usa-story-step` (+ `usa:step` since 11.8) | `usa:step` only |
| Attributes | some elements read attributes they did not observe (changes after mount were ignored) | every attribute an element reads re-renders it when it changes |
| Contract test | report only (`docs/contract-report.md`) | blocking: zero findings, every exception documented with a reason |

All `usa:*` events bubble and are composed, with a `detail` object. `usa-codemod-12` rewrites the legacy names in quoted
strings (`addEventListener('usa-beat', …)`), Vue `@usa-beat`, Angular `(usa-beat)` and Svelte `on:usa-beat`; the
`data-usa-beat` attribute is not an event and stays.

## Not breaking in 12.0

- Old import paths (`motionary/components/core`, `motionary/components/ai`, `motionary/design`, `motionary/components/design`,
  `motionary/components/angular`, `motionary/manifest(.schema).json`) keep working through 12.x — their types are marked
  `@deprecated` — and are removed in **13.0** ([public-api.md](./public-api.md)). Nothing warns at runtime.
- Click-activated hosts became keyboard-reachable in 11.8 (`tabindex="0"`, `role="button"` unless you set them).

## The contract check

`npm run check:contract` (CI) fails on any contract finding; `npm run contract:preview` lists them. CDN URLs move with the major: `motionary@11/` → `motionary@12/`.
