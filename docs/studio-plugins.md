# Studio plugins (plugin API v1, experimental)

> **Experimental** — may change in a minor release; not covered by the stability promise ([stability.md](./stability.md)).

Since 16.2 Motion Studio can run **third-party panels and exporters** in a sandbox. The plugin API is **experimental**
([stability.md](./stability.md#experimental)): it may change in a minor release, so pin the exact Motionary version a
plugin was written for. Manifests declare `api: 1` (`PLUGIN_API_VERSION`), so a host can refuse a manifest written for a
different version.

- A plugin declares what it needs in a **manifest**; the host answers a call only when that permission was granted,
  and every call (allowed or not) is written to `host.audit`.
- A plugin can **propose** a new project, never write it: the host passes a copy to your `propose` callback, and the
  Studio decides (apply it as one undo step, or not).
- A plugin that throws, misses the exporter time limit (`timeoutMs`, default 2000 ms) or floods the host
  (`maxMessages` per second, default 200) is marked **crashed** and terminated. The Studio and every other plugin
  keep working, and no host method throws.

```js
import { createPluginHost, createIframeTransport } from 'motionary/studio/plugins';

const host = createPluginHost({
  getProject: () => studio.getProject(),
  propose: (project, { plugin, note }) => confirm(`${plugin}: ${note}`) && (studio.history.apply(project), true),
  onCrash: (plugin, reason) => console.warn(plugin, reason),
});

// Code as a string runs in a dedicated Worker (no DOM, own thread).
host.load({ id: 'com.example.stats', name: 'Stats', version: '1.0.0', api: 1, permissions: ['project:read', 'panel'] }, `
  (async () => {
    const p = await motionary.getProject();
    await motionary.setPanel({ title: 'Stats', text: p.scene.layers.length + ' layers' });
  })();
`);

host.panels();             // [{ plugin: 'com.example.stats', title: 'Stats', text: '3 layers' }]
await host.runExporter('com.example.csv'); // { ok: true, value: { files: { 'scene.txt': '…' } } } for a plugin with 'exporter'
```

## Manifest

| Field | Rule |
| --- | --- |
| `id` | `^[a-z0-9][a-z0-9.-]{1,63}$` (e.g. `com.example.stats`), unique per host |
| `name` | non-empty text |
| `version` | semver |
| `api` | `1` |
| `permissions` | any of `project:read`, `project:propose`, `panel`, `exporter`; anything else is refused |

`parsePluginManifest(json)` validates a manifest (≤ 16 KB) and drops unknown fields.

## Inside a plugin

The plugin sees one global, `motionary`:

| Call | Permission | Result |
| --- | --- | --- |
| `getProject()` | `project:read` | a copy of the project |
| `propose(project, note?)` | `project:propose` | `true` when the Studio applied it |
| `setPanel({ title?, text })` | `panel` | text only (≤ 8 KB) — the Studio renders it as text, never as HTML |
| `onExport(fn)` | `exporter` | registers `fn(project) → { path: text }` for `host.runExporter(id)` |

Exporter paths must be relative (`css/scene.css`; no `..`, no absolute paths, no backslashes), values must be text,
≤ 500 files and ≤ 10 MB in total. A refused export does not crash the plugin.

## Sandboxes

- `host.load(manifest, code)` / `createWorkerTransport(code)` — a Worker from a Blob URL. Best for exporters: an
  endless loop cannot block the Studio and is cut by the time limit.
- `createIframeTransport(code, parent?)` — a hidden `<iframe sandbox="allow-scripts">` (opaque origin: no cookies,
  storage or access to the Studio DOM) with a `default-src 'none'` CSP, so the plugin cannot load or send anything.
- `createLocalTransport(fn)` — runs `fn(motionary)` in-process with the same message protocol. **No sandbox**: for
  tests and code you trust.

`pluginWorkerSource(code)` / `pluginFrameSource(code)` return the generated sources if you host them yourself.

Size: `motionary/studio/plugins` is its own entry (about 3 KB gzip, budget line 4 KB); it is not part of lite or
`motionary/studio`.
