# `motionary-mcp` — the component catalog as an MCP server

`motionary-mcp` (10.4+) is a **read-only** [Model Context Protocol](https://modelcontextprotocol.io) server that ships inside the `motionary` package. AI assistants that speak MCP (Claude Desktop / Claude Code, Cursor, VS Code, Windsurf, Zed, …) can ask it which `<usa-*>` component fits a UI need, read the component's API and get a snippet that already installs, imports and registers every prerequisite in the right order.

- **Zero dependencies**, stdio transport (newline-delimited JSON-RPC 2.0), protocol versions `2025-06-18`, `2025-03-26`, `2024-11-05`.
- **Read-only**: it answers from the AI manifest bundled in the package (`motionary/tooling/manifest.json`, the same data as the site's `components.json` / `llms.txt`). It never writes files, executes code or touches the network. Every tool is annotated `readOnlyHint: true`.
- Tested in CI with the official MCP TypeScript SDK client over stdio.

## Run it

```bash
npx -y -p motionary motionary-mcp          # any machine with Node 18+
npx motionary-mcp                          # inside a project that has motionary installed
MOTIONARY_MANIFEST=./manifest.json npx -p motionary motionary-mcp   # another manifest
```

Client configuration (the usual `mcpServers` shape):

```json
{
  "mcpServers": {
    "motionary": { "command": "npx", "args": ["-y", "-p", "motionary", "motionary-mcp"] }
  }
}
```

Claude Code: `claude mcp add motionary -- npx -y -p motionary motionary-mcp`.

## Tools

| Tool | Arguments | Returns |
|---|---|---|
| `list_components` | `category?`, `requires?` (`scroll`, `motionary/runtime/text`, `none`), `since?` (`10.0`), `limit?` | tag, title, category, import path, prerequisites, version introduced |
| `search_components` | `query`, `limit?` | best matches for a UI need ("animated counter", "pinned scroll scene") with a score |
| `get_component` | `tag` (`usa-tilt`, `tilt` or `<usa-tilt>`) | attributes, events, slots, methods, import / define, CDN, prerequisites (install, import + register order, CDN order), example, variants |
| `get_example` | `tag`, `variant?` (`html` = CDN, `esm`, or a variant id) | a working example |
| `scaffold_snippet` | `tags[]`, `framework?` (`html`, `esm`, `react`, `vue`, `svelte`) | one snippet for several components, prerequisites first |

| `list_templates` (2.3, 14.8) | `query?` | the starter Studio templates shipped in the package (integrity-checked): id, name, version, SPDX license, author, required modules, layer / file counts |
| `get_template` (2.3, 14.8) | `id` | manifest, info, the Scene v2 document and a still preview (one inline HTML file without scripts) — see [studio-templates.md](./studio-templates.md) |
| `export_scene` (2.3, 14.8) | one of `scene` / `project` / `template`, `inline?`, `js?`, `fps?`, `title?` | the [14.7 standalone export](./studio-export.md): files (utf8 text, binary as base64), `digest` (`frameDigest`) and the report; writes nothing |
| `propose_edit` (2.4, 15.1) | `scene`, `prompt`, `selection?`, `requestId?` | a validated edit proposal: ops (each with a sentence), JSON `diff`, changed `layers`, `preview`, checks, and `provenance { generator: 'motionary-mcp/propose_edit', requestId }` (`requestId` = the argument or `params._meta.correlationId`); `applied: false` — writes nothing, Studio applies it only after review ([studio-provenance.md](./studio-provenance.md)) |
| `validate_scene` (2.5, 15.9) | `scene`, `ops?`, `version?`, `browser?` | the scene checks `validate_snippet { scene }` runs (schema, component compatibility, headless render of every frame, optional ops and real browser) under `schema: 'motionary-mcp/validate_scene@1'` — motionary-mcp 3.0 (16.0) keeps scenes here only ([deprecations-v16.md](./deprecations-v16.md)) |

**Deprecations (2.5, 15.9).** A call that uses an input shape motionary-mcp 3.0 removes still works and its result carries
`deprecations: [{ id, removedIn: '16.0', message, doc }]` (one stderr line per id): `validate_snippet { scene }`
(`mcp-snippet-scene` → `validate_scene`), `scene` as JSON text (`mcp-scene-text` → pass an object), and `check_compat`
(`mcp-check-compat` → `check_compatibility`). See [deprecations-v16.md](./deprecations-v16.md).

Unknown tags come back as tool errors (`isError: true`) with a hint to search first.

## Resources

- `motionary://manifest` — the whole manifest (JSON)
- `motionary://llms.txt` — the short catalog text
- `motionary://component/{tag}` — one component (JSON; resource template)

## Notes

- The server version follows its own track (`0.x` until Motionary 11.0 makes it `1.0`); the catalog version is the installed `motionary` version (`initialize` → `instructions`).
- MCP 2.0 tools (`suggest_motion`, `validate_snippet`) arrive in 10.7.

## Mounted validation (12.2)

`validate_snippet` takes `mount: true` to go beyond static analysis: the snippet's markup is mounted in a headless DOM
([jsdom](https://github.com/jsdom/jsdom), an **optional peer** — `npm i -D jsdom`) together with the real Motionary bundles
(`dist/components.umd.js`, `dist/widgets.umd.js`, and the `motionary/runtime` modules the snippet loads, in the correct order). The
snippet's own `<script>` code is never executed.

| Check | Reported as |
|---|---|
| a `<usa-*>` tag is not defined by the bundles, or throws while upgrading | error |
| a prerequisite is missing — the component's own `requires motionary/runtime/…` error | error (or `mount.confirmed` when the static pass already flagged it) |
| a legacy event name removed in 12.0 (`usa:beat`, `usa:ready`, …) | error, with the `usa:*` replacement |
| a `usa:*` event no component in the snippet emits | warning |
| an attribute the element reads but does not observe (contract exemption: set it before mount) | warning |

The result adds `mount: { mounted, environment: 'jsdom', components: [{ tag, defined, upgraded }], confirmed }`; without jsdom it is
`mount: { mounted: false, skipped }` and the static result is unchanged. Set `MOTIONARY_DIST` to point the server at another build.

## Version-aware answers (12.5)

The server reads the motionary version installed in the project it runs in (`./node_modules/motionary/package.json`, or
`MOTIONARY_INSTALLED`). `list_components` and `get_component` take `version` (default: that installed version):
`list_components` then lists only what that version has, and `get_component` adds `compat: { installed, available, since, changedAfter }`.
The `check_compat` tool lists, for a version, the components added later (with the release that added them) and the ones whose
release notes changed after it, plus the runtime modules they need. See [version-compat.md](./version-compat.md).
