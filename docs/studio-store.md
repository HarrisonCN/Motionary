# Team projects (`motionary/studio/store`, 15.5)

> **Experimental** — may change in a minor release; not covered by the stability promise ([stability.md](./stability.md)).

A **ProjectStore** keeps Studio projects with a revision history and optimistic concurrency. Every write names the
revision it was based on; a write on a stale base is refused as a **conflict** instead of overwriting a teammate's
work. Motionary ships **no server**: use the in-memory or IndexedDB store, or point the HTTP store at your own backend.

```js
import { createHttpProjectStore, toAppStorage } from 'motionary/studio/store';
import { createStudioApp } from 'motionary/studio/app';

const store = createHttpProjectStore('https://studio.example.com/api/t/acme', { headers: { authorization: `Bearer ${token}` } });
const app = await createStudioApp(root, { stage, name: 'hero', storage: toAppStorage(store, { merge: 'auto' }) });
await app.reopen();   // remembers the revision it read
await app.save();     // saves on that revision; if someone saved in between → merge or a clear "saved by someone else" error
```

## Stores

| Store | Where | Notes |
|---|---|---|
| `createMemoryProjectStore({ maxRevisions, maxBytes })` | memory | tests, demos, one tab |
| `createIndexedDBProjectStore({ dbName })` | browser IndexedDB | per origin; database `motionary-projects` |
| `createHttpProjectStore(baseUrl, { fetch, headers })` | your backend | REST shape below |

All stores have the same async API: `list()`, `get(name)`, `put(name, text, { baseRev })`, `delete(name, { baseRev })`,
`history(name)` (newest first, capped by `maxRevisions`, default 50), `getRevision(name, rev)`. Revisions look like
`3-1a2b3c4d` (counter + content tag). Errors are `StoreError` with `code`: `conflict` (with `currentRev`), `not-found`,
`forbidden`, `quota`, `invalid` (bad name: empty, `/`, `\`, `..`, control characters, > 128 chars), `too-large`
(default 4 MB per project), `network`, `server`.

## HTTP backend shape

| Request | Response |
|---|---|
| `GET {base}/projects` | `[{ name, rev, size, savedAt }]` |
| `GET {base}/projects/:name` | `{ name, rev, text, savedAt }` · 404 → `null` |
| `PUT {base}/projects/:name` body `{ text }`, `If-Match: <rev>` (omit to create) | `{ rev }` · 409 `{ currentRev }` on a stale base |
| `DELETE {base}/projects/:name`, `If-Match: <rev>` | 204 |
| `GET {base}/projects/:name/revisions[/:rev]` | history / one revision |

401/403 → `forbidden`, 429/507 → `quota`, 413 → `too-large`. Tenancy, authentication, quotas and audit belong to the
backend (or the gateway in front of it). [`examples/project-store-server`](../examples/project-store-server/server.mjs)
is a ~100-line node:http reference: one store per tenant, a token for tenant B on `/t/A/…` is refused (403) and written
to the audit log (`cross-tenant-denied`), project-count and size quotas answer 429 (`quota-exceeded` audited). It is
tested in CI (`test/project-store-server-15-5.test.ts`).

## Conflicts and merging

`detectConflict(base, mine, theirs)` lists the layers each side added, edited or removed since `base`, and the layers
both changed differently. `mergeProjects(base, mine, theirs)` merges at layer granularity: edits to different layers
are combined (starting from `theirs`, applying `mine`'s layer changes; layers `mine` added keep their place), the same
layer changed on both sides is `{ ok: false, conflicts }` and nothing is merged. A layer removed on one side and edited
on the other is a conflict. `toAppStorage(store, { merge: 'auto' })` does this on save; the default (`'refuse'`)
throws so the person can reopen and redo their change.

## Not in 15.5

- A Gateway-hosted store: MCP Gateway has tenants and quotas, but no project-store route; put your backend (or the
  reference server) behind it as an ordinary HTTP upstream. Gateway tenant template catalog and a Pages template
  gallery (deferred from 14.8) are not part of this release.
- Real-time co-editing (presence, live cursors) — out of scope; merges happen on save.
