# Motionary MCP behind MCP Gateway (13.7.0)

`motionary-mcp` (stdio, read-only component catalog) runs unchanged behind
[`@winstonsayno/mcp-gateway`](https://www.npmjs.com/package/@winstonsayno/mcp-gateway), which gives AI clients one
authenticated, rate-limited and audited Streamable HTTP endpoint for it. The two projects stay separate: the gateway is
**not** a dependency, devDependency or peer of `motionary`, and `motionary` is not a dependency of the gateway.

```
AI client ──Streamable HTTP (/mcp, Bearer key)──▶ mcp-gateway ──stdio──▶ motionary-mcp
```

## Run it

```yaml
# mcp-gateway.yml
version: 11
port: 4000
host: 127.0.0.1
auth:
  strategy: api-key
  apiKeys: ["overridden-by-MCP_GATEWAY_API_KEYS"]
servers:
  - id: motionary
    name: Motionary MCP
    transport: stdio
    command: node
    args: ["node_modules/motionary/bin/motionary-mcp.mjs"]
    enabled: true
mcp:
  allowedOrigins: []
```

```sh
npm i motionary@13
export MCP_GATEWAY_API_KEYS=$(openssl rand -hex 24)
npx @winstonsayno/mcp-gateway@latest start -c mcp-gateway.yml
# MCP clients: http://127.0.0.1:4000/mcp with Authorization: Bearer $MCP_GATEWAY_API_KEYS
```

## Tools seen through the gateway (motionary-mcp 2.1, Motionary 13.7.0)

| Tool | Schema version | Since |
|---|---|---|
| `list_components` | 1.0 (contract frozen) | 10.4 |
| `search_components` | 1.1 (same input / result fields; 13.7 ranking: exact tag first, fuzzy, stable order) | 10.4 |
| `get_component` | 1.0 (contract frozen) | 10.4 |
| `get_example` | 1.0 | 10.4 |
| `scaffold_snippet` | 1.1 (registers every element an example uses; CDN pages import modules from the CDN) | 10.4 |
| `suggest_motion` | 1.0 | 10.7 |
| `validate_snippet` | 1.2 (`browser: true \| 'auto'` — real headless browser when Playwright is available, static fallback; `mode` says which ran) | 10.7 |
| `check_compat` | 1.0 | 12.5 |
| `check_compatibility` | 1.0 — **new**: framework / version / browser support per component | 13.7 |
| `suggest_fix` | 1.0 — **new**: concrete patches (wrong tag, mistyped / deprecated attribute, missing import, bare CDN import, missing prerequisite, removed 13.0 paths) | 13.7 |

Every tool definition carries its version in `_meta["motionary/schemaVersion"]`; the new tools also publish an
`outputSchema` and put a `schema` id (`motionary-mcp/check_compatibility@1`, `motionary-mcp/suggest_fix@1`,
`motionary-mcp/validate_snippet@1`) in each result. A schema's major changes only on an incompatible change.

## Tested here

`scripts/gateway-interop.mjs` starts `npx -y @winstonsayno/mcp-gateway@latest` with a temporary config that runs this
checkout's `bin/motionary-mcp.mjs`, then speaks MCP to the gateway: `initialize` → `tools/list` (all ten tools above must
be listed) → `tools/call` of `search_components`, `check_compatibility`, `suggest_fix` and `validate_snippet`. The
**Gateway interop** workflow (`.github/workflows/gateway-interop.yml`) runs it on every pull request and push to main;
the gateway is fetched only inside that job. Locally: `node scripts/gateway-interop.mjs` (or
`MGW_CMD="node /path/to/mcp-gateway/dist/cli.js" node scripts/gateway-interop.mjs` for an unreleased gateway).

## Gateway side (set in the gateway repository, not here)

The gateway's own end-to-end test (`test/motionary-e2e.test.ts`, CI job "MCP compat matrix") reads two variables:

```sh
MOTIONARY_VERSION=13.7.0
MOTIONARY_EXPECT_TOOLS=get_example,scaffold_snippet,suggest_motion,validate_snippet,check_compat,check_compatibility,suggest_fix
```

(`list_components`, `search_components` and `get_component` are its built-in core set.)
