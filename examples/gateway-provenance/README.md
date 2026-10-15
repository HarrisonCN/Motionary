# AI edit → MCP Gateway lineage (Motionary 15.1)

Integrated against **Gateway 15.1 canary** (`@winstonsayno/mcp-gateway@15.1.0-canary.1`, npm dist-tag `canary`). The
gateway's call lineage is a canary feature of a development prerelease; this example does not claim a stable gateway
release.

```sh
npm run build                                   # or run it from an installed motionary package
node examples/gateway-provenance/run.mjs        # downloads the gateway canary with npx
MGW_CMD="node /path/to/mcp-gateway/dist/cli.js" node examples/gateway-provenance/run.mjs
```

What it does:

1. Starts the gateway with `motionary-mcp` behind it (stdio) and an operator API key (the operations console is on by
   default and readable by unscoped keys).
2. Calls `propose_edit` over `/mcp` with one correlation id — sent as `X-Request-Id` (the gateway keeps it with the call)
   and as the `requestId` argument (motionary-mcp puts it in the proposal's `provenance`). The project is unchanged:
   `propose_edit` never writes.
3. Applies the proposal's ops the way Motion Studio does after a person accepts them: through
   `withProvenance(history, provenance)`, so the edit and its `{ generator, requestId, at }` record are one undo step.
4. Reads `GET /api/v1/admin/ops/lineage?correlationId=<requestId>` and joins it with `matchLineage()`: exactly one
   project record ↔ one gateway call (`motionary/propose_edit` via `mcp`).
5. Undoes the edit: the record goes with it.

Expected output ends with `lineage join OK: record p1 (motionary-mcp/propose_edit, requestId …) ↔ gateway call …` and
`undo removed the edit and its record together`. Against a gateway without call lineage (14.x, 15.0 rc) step 4 answers
404 and the example says so.

See [docs/studio-provenance.md](../../docs/studio-provenance.md).
