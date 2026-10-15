# AI edit provenance (`motionary/studio/provenance`, 15.1)

> **Experimental** — may change in a minor release; not covered by the stability promise ([stability.md](./stability.md)).

Every change an AI (or any other generator) makes to a Studio project can say where it came from:
`{ generator, model?, requestId?, at }`. The record is written **into the document** (`meta["motionary:provenance"]`) in
the **same undo step** as the change, so it is saved with the project, survives reopen, and disappears again on undo.
A proposal nobody accepted writes nothing — and leaves no record.

```js
import { createAiReview, proposeAiEdit } from 'motionary/studio/ai';
import { withProvenance, aiChanges, matchLineage, createProvenancePanel } from 'motionary/studio/provenance';

const proposal = await proposeAiEdit(history.doc, 'fade up the card', { provider });
const tracked = withProvenance(history, () => ({ generator: 'motionary/studio/ai', model: 'my-model', requestId, at: new Date().toISOString() }));
const review = createAiReview(tracked, proposal); // the 14.6 review: accept / reject per op
review.acceptAll();
review.apply();        // ONE undo step: the edit + its provenance record
aiChanges(history.doc, { aiOnly: true }); // [{ id: 'p1', generator, model, requestId, at, label, layers: ['card'] }]
createProvenancePanel(el, history);       // newest first, "AI changes only" toggle, request-id filter
```

| Export | What it does |
|---|---|
| `withProvenance(history, info)` | Wraps an editor history: every `apply()` through it records `info` (or `info()` per change) with the changed layer ids, in the same step. A no-op change writes nothing. Everything else (undo / redo / gestures / subscribe) is the wrapped history. |
| `recordProvenance(doc, p, { label, layers })` | Pure: `doc` with one more record. Throws on an invalid value. At most 500 records are kept (oldest dropped). |
| `validateProvenance(p)` | `[]` or the problems: `generator` required, `model` a string, `requestId` 1–128 of `A–Z a–z 0–9 . _ : -`, `at` an ISO date. |
| `provenanceOf(doc)` / `aiChanges(doc, { aiOnly, requestId, generator })` | The records (copies), oldest first / filtered. |
| `changedLayers(a, b)` | Layer ids added, removed or edited between two documents. |
| `matchLineage(records, lineage)` | Joins records with MCP Gateway lineage entries (or the `{ lineage, total }` response body): `matched`, `missing` (has a request id the gateway does not know), `unattributed` (no request id). |
| `createProvenancePanel(root, history)` | A small list view of the records. |

## Tracing an AI edit to the gateway (MCP Gateway 15.1 canary)

`requestId` follows MCP Gateway's client correlation-id rule (`X-Request-Id`, else `X-Correlation-Id`, on REST or `/mcp`:
1–128 characters of `A–Z a–z 0–9 . _ : -`). Send one id per AI edit with the call, keep it in the provenance record,
and the gateway's call lineage finds the call behind it:

```
GET /api/v1/admin/ops/lineage?correlationId=<requestId>   →   { lineage: [{ requestId, correlationId, identity, tenant, target, decision, upstream, cost, traceId }], total }
```

`matchLineage(provenanceOf(doc), body)` then pairs each applied AI change with its gateway record. This was integrated
against **Gateway 15.1 canary** (`@winstonsayno/mcp-gateway@15.1.0-canary.1`, npm `canary`); it is a development
prerelease of the gateway, so treat the lineage route as a canary feature until the gateway ships it in a stable
release. See [examples/gateway-provenance](../examples/gateway-provenance/README.md).

## `propose_edit` (motionary-mcp 2.4)

The MCP server's `propose_edit` tool returns the same proposal as structured data — ops with a sentence each, the JSON
diff, the changed layer ids, the preview and the checks — plus `provenance: { generator: 'motionary-mcp/propose_edit',
requestId }`. It never writes (`applied: false`); the requestId is the `requestId` argument or the MCP
`params._meta.correlationId`. Studio applies the ops only after a person accepts them in the review. See
[mcp.md](./mcp.md).

## What it does not do

- It does not prove who made a change: a record is what the editor was told. Use it for review and auditing, not for
  authorization.
- It stores no prompt text, scene content or keys — only generator, model, request id, time, label and layer ids.
