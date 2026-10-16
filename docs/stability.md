# Stability: stable core, experimental surfaces and LTS (17.0)

Motionary's focus is **zero dependencies, fixed size budgets and accessible motion**. Since 16.3 the project adds no
new components or effects; releases improve, document and test what exists. Breaking changes go through a minor
release with a deprecation first. 17.0 is the last planned major: after it, changes ship as minors with deprecations,
and anything deprecated stays until a future major at the earliest.

<a id="stable-core"></a>
## Stable core

Covered by semver and by the deprecation policy ([deprecations.md](./deprecations.md)):

| Surface | Entry points |
|---|---|
| Scroll API | `motionary`, `motionary/element`, `motionary/presets/*`, the framework adapters (`motionary/react` · `vue` · `svelte` · `solid` · `angular`) |
| Motion Core and engine | `motionary/core`, `motionary/motion`, `motionary/motion/layout` |
| Motion document | `motionary/scene` (Scene Format v3), `motionary/scene/v3`, `motionary/scene/symbols` — v3 files written by 16.x or 17.x keep validating on every 17.x |
| Runtime | `motionary/runtime`, `motionary/runtime/*` |
| Components | `<mo-*>` elements and their `<usa-*>` names (17.0: `mo-*` is the preferred name; `usa-*` is deprecated but keeps working, removal not before a future major — [deprecations-v17.md](./deprecations-v17.md#mo-names)): `motionary/components`, `motionary/components/*`, `motionary/widgets/*`, `motionary/effects/*` and their CDN bundles (`window.MotionaryComponents` = `window.UsaComponents`) |
| CLI | `npx motionary doctor` / `migrate` / `compat`, the codemods (`mo-codemod`, `usa-codemod-*`) |

Every stable entry point has a gzip budget in `size-budget.json`, zero runtime dependencies and the component contract
(keyboard, ARIA, `prefers-reduced-motion`, lifecycle) checked in CI.

<a id="experimental"></a>
## Experimental

May change or be removed in a **minor** release; not covered by the stability promise. Use them, pin the exact
version, and read the CHANGELOG before upgrading:

| Surface | Entry points / tools |
|---|---|
| Motion Studio | `motionary/studio`, `motionary/studio/*` (`canvas`, `app`, `assets`, `export`, `templates`, `store`, `native`, `provenance`, `ai`), incl. **`motionary/studio/plugins`** (16.2), **`motionary/studio/budget`** (16.3) (plugin manifests declare `api: 1` = `PLUGIN_API_VERSION` so a host can refuse other versions), and the `motionary/components/studio-*` entries |
| Timeline editor | `motionary/components/timeline-editor` |
| AI | `motionary/studio/ai`, the AI provider and motion parser (`docs/ai-provider.md`) |
| MCP server | `motionary-mcp` 3.x (`docs/mcp.md`) |
| Figma plugin | `figma-plugin/` |
| Cross-platform export | `npx motionary export --target css \| wxss \| arkts` |

<a id="lts"></a>
## LTS policy

- `latest` follows the newest 17.x minor. The previous major's last minor gets an `-lts` dist-tag when a major ships:
  **`v16-lts` = the last 16.x release**, with security and severe fixes at least until 18.0 ships (`v15-lts` and
  `v14-lts` were set the same way). No 18.0 is planned.
- `npx motionary@v16-lts …` keeps the commands 17.0 removed (`doctor --v15`, `migrate --to 15`).
- Lite (`motionary/components/lite`) stays ≤ 70 KB gzip with zero runtime dependencies on every line.
- Tag reference: [versions.md](./versions.md).

## Not verified

Real physical-device testing (iOS Safari + VoiceOver, Android Chrome + TalkBack, pen / trackpad, Windows forced colors)
is **deferred**: it has not been run and is not claimed. CI covers phones only through emulated profiles
([mobile.md](./mobile.md#not-verified)).
