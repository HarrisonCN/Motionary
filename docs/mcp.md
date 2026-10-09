# `motionary-mcp` — the component catalog as an MCP server

`motionary-mcp` (10.4+) is a **read-only** [Model Context Protocol](https://modelcontextprotocol.io) server that ships inside the `motionary` package. AI assistants that speak MCP (Claude Desktop / Claude Code, Cursor, VS Code, Windsurf, Zed, …) can ask it which `<usa-*>` component fits a UI need, read the component's API and get a snippet that already installs, imports and registers every prerequisite in the right order.

- **Zero dependencies**, stdio transport (newline-delimited JSON-RPC 2.0), protocol versions `2025-06-18`, `2025-03-26`, `2024-11-05`.
- **Read-only**: it answers from the AI manifest bundled in the package (`motionary/manifest.json`, the same data as the site's `components.json` / `llms.txt`). It never writes files, executes code or touches the network. Every tool is annotated `readOnlyHint: true`.
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

Unknown tags come back as tool errors (`isError: true`) with a hint to search first.

## Resources

- `motionary://manifest` — the whole manifest (JSON)
- `motionary://llms.txt` — the short catalog text
- `motionary://component/{tag}` — one component (JSON; resource template)

## Notes

- The server version follows its own track (`0.x` until Motionary 11.0 makes it `1.0`); the catalog version is the installed `motionary` version (`initialize` → `instructions`).
- MCP 2.0 tools (`suggest_motion`, `validate_snippet`) arrive in 10.7.
