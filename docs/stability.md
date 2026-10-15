# Stability: stable core and experimental surfaces (16.3)

Motionary's focus is **zero dependencies, fixed size budgets and accessible motion**. From 16.3 the project adds no
new components or effects; releases improve, document and test what exists. Breaking changes go through a minor
release with a deprecation first; no major after 17.0 is planned.

## Stable core

Covered by semver and by the deprecation policy ([deprecations.md](./deprecations.md)):

| Surface | Entry points |
|---|---|
| Scroll API | `motionary`, `motionary/element`, `motionary/presets/*`, the framework adapters (`motionary/react` · `vue` · `svelte` · `solid` · `angular`) |
| Motion Core and engine | `motionary/core`, `motionary/motion`, `motionary/motion/layout` |
| Motion document | `motionary/scene` (Scene Format v3), `motionary/scene/v3`, `motionary/scene/symbols` |
| Runtime | `motionary/runtime`, `motionary/runtime/*` |
| Components | `<usa-*>` elements: `motionary/components`, `motionary/components/*`, `motionary/widgets/*`, `motionary/effects/*` and their CDN bundles |
| CLI | `npx motionary doctor` / `migrate` / `compat`, the `usa-codemod-*` codemods |

Every stable entry point has a gzip budget in `size-budget.json`, zero runtime dependencies and the component contract
(keyboard, ARIA, `prefers-reduced-motion`, lifecycle) checked in CI.

## Experimental

May change or be removed in a **minor** release; not covered by the stability promise. Use them, pin the exact
version, and read the CHANGELOG before upgrading:

| Surface | Entry points / tools |
|---|---|
| Motion Studio | `motionary/studio`, `motionary/studio/*` (`canvas`, `app`, `assets`, `export`, `templates`, `store`, `native`, `provenance`, `ai`), incl. **`motionary/studio/plugins` (16.2)** and **`motionary/studio/budget` (16.3)**, and the `motionary/components/studio-*` entries |
| Timeline editor | `motionary/components/timeline-editor` |
| AI | `motionary/studio/ai`, the AI provider and motion parser (`docs/ai-provider.md`) |
| MCP server | `motionary-mcp` (`docs/mcp.md`) |
| Figma plugin | `figma-plugin/` |
| Cross-platform export | `npx motionary export --target css \| wxss \| arkts` |

## Not verified

Real physical-device testing (iOS Safari + VoiceOver, Android Chrome + TalkBack, pen / trackpad, Windows forced colors)
is **deferred**: it has not been run and is not claimed. CI covers phones only through emulated profiles
([mobile.md](./mobile.md#not-verified)).
