# Studio templates (14.8)

`motionary/studio/templates` (= `motionary/components/studio-templates`) packages a Motion Studio project as a
reusable **template**, checks it before anything touches your project, installs it as **one undo step** and uninstalls
it so the project is **byte-identical** to the one before the install. Its own entry: not in lite, `motionary/core`,
`motionary/motion`, `motionary/studio` or `motionary/studio/export`. Zero dependencies, no DOM, no network, nothing
evaluated — a template is data.

```js
import { parseTemplate, verifyTemplate, templateInfo, installTemplate, uninstallTemplate, previewTemplate } from 'motionary/studio/templates';

const text = await (await fetch('/templates/fade-up-hero.motionary-template.json')).text();
const r = parseTemplate(text);                 // never throws: { ok, template, info, doc, files, errors }
if (!r.ok) console.warn(r.errors);             // [{ path, reason, message }]

templateInfo(r.template, { available: ['motionary/studio'] });
// { id, name, version, license: 'MIT', author, requires: ['motionary/studio'], missing: [], layers, files, duration, integrity, signed }

const res = installTemplate(studio.history, r.template);   // ONE undo step
// res.files: Map('templates/fade-up-hero/img/dots.svg' → bytes) — save them next to the project
uninstallTemplate(studio.history, 'fade-up-hero');         // removes exactly what was installed
```

## The format: `motionary-template` v1

```json
{
  "format": "motionary-template",
  "version": 1,
  "manifest": { "id": "fade-up-hero", "name": "Fade-up hero", "version": "1.0.0", "license": "MIT", "author": "Motionary",
                "description": "…", "requires": ["motionary/studio"], "tokens": { }, "preview": { "time": 300 } },
  "integrity": "sha256-…",
  "signature": { "alg": "Ed25519", "keyId": "acme-2026", "value": "…" },
  "pack": "{\"format\":\"motionary-studio-pack\",…}"
}
```

| Field | Rule |
|---|---|
| `manifest.id` | 1–64 of `a-z 0-9 . _ -`, starting and ending with a letter or digit |
| `manifest.version` | SemVer (`1.2.3`, pre-release / build allowed) |
| `manifest.license` | an SPDX expression: `MIT`, `Apache-2.0`, `MIT OR Apache-2.0`, `GPL-2.0-only WITH Classpath-exception-2.0`, `LicenseRef-…`, `UNLICENSED` |
| `manifest.requires` | up to 32 Motionary module paths (`motionary/studio`, `motionary/runtime/text`) — shown before install, enforced with `installTemplate(…, { available })` |
| `manifest.tokens` | optional `motionary/tokens` theme (JSON, ≤ 64 000 characters) — carried with the template for your app to apply; installing does not change your theme |
| `manifest.preview.time` | the time (ms) a still preview shows |
| `pack` | a [14.5 studio pack](./studio-assets.md) (the project as Scene v2 + every referenced local asset with size and CRC-32) |
| `integrity` | `sha256-` + base64 of SHA-256 over the canonical manifest (keys sorted) and the pack text |
| `signature` | optional: the publisher's Ed25519 signature of the integrity value |

Limits (`TEMPLATE_LIMITS`): 10 MB of text, 200 layers, 20 000 keyframes, 100 files, 5 MB per file.

## What is refused

`parseTemplate` (and therefore `installTemplate`, `templateInfo`, `previewTemplate`) refuses — with a `reason` per
problem and **without changing the project** — anything that:

- is not JSON / not a `motionary-template` v1 file / has unknown top-level or manifest keys (`format`, `manifest`);
- has a bad id, name, version, license, requires, token theme or preview time (`id`, `name`, `semver`, `license`,
  `requires`, `tokens`, `preview`);
- does not match its integrity value — a changed manifest, a changed pack or a forged value (`integrity`);
- packs a script-like file (`.js`, `.html`, `.wasm`, …) (`script`), a path that leaves the project (`../`, absolute,
  `scheme:`) (`path`), a file whose size / CRC-32 / base64 do not check out or an asset the pack does not contain
  (`pack`);
- is over a limit (`size`, `limit`).

## Publisher signatures

```js
import { signTemplate, verifyTemplate } from 'motionary/studio/templates';

const signed = await signTemplate(template, privateKey, 'acme-2026');          // Ed25519 CryptoKey (WebCrypto)
await verifyTemplate(signed, { keys: { 'acme-2026': 'base64 raw 32-byte public key' /* or a CryptoKey */ }, requireSignature: true });
// { ok, integrity: true, signature: 'valid' | 'invalid' | 'missing' | 'untrusted' | 'unsupported', errors }
```

The signature covers the integrity value the content actually has, so a re-hashed change keeps a matching integrity
value but fails the signature (`'invalid'`). `'untrusted'` = signed by a key you did not list; with
`requireSignature: true` only `'valid'` passes. Ed25519 in WebCrypto: Node 20+, Chrome 137+, Firefox 129+, Safari 17+;
elsewhere the answer is `'unsupported'` (integrity is still checked — SHA-256 is plain JS).

## Install / uninstall

`installTemplate(history, template, { prefix?, at?, available? })`:

- appends the template's layers as **one** `history.apply` step labelled `Install template <id>@<version>`;
- prefixes layer, keyframe and parent ids (default prefix `<id>--`; refused on any id collision — `conflict`);
- moves asset references under `templates/<id>/` and returns those files in `files` (save them with the project);
- `at` shifts the template's keyframes (ms); `solo` is removed (a template never mutes your layers) with a warning;
- extends an explicit `duration` that is shorter than the template, and remembers the original;
- records the install in `meta['motionary:templates']` (`installedTemplates(doc)` lists them); refuses the same id
  twice (`installed`), missing `requires` when `available` is given (`requires`) and a non-object `meta` (`meta`).

`uninstallTemplate(history, id)` removes those layers, the record, the `meta` / key / duration it created — one undo
step; `files` lists the asset paths to delete. With several templates installed, any uninstall order ends at the
original bytes (`serializeStudioProject` before install === after uninstall; tested). It refuses when one of your
layers was moved into a group of the template (`in-use`).

## Preview

```js
const p = previewTemplate(template);   // { html, sandbox: '', time, report }
iframe.setAttribute('sandbox', p.sandbox);
iframe.srcdoc = p.html;
```

The [14.7 standalone export](./studio-export.md) as one inline file, **without scripts** (CSS `@keyframes` only, assets
as `data:` URIs), frozen at `manifest.preview.time` (`{ time }` to override, `null` to let it play). `{ js: true }`
adds the player and returns `sandbox: 'allow-scripts'`. The browser spec reads the frame from a
`sandbox="allow-same-origin"` frame (still no scripts) and compares it with `sampleTimelineDoc`.

## Starter templates and MCP

The package ships three MIT templates in `templates/` (`fade-up-hero`, `stagger-cards`, `badge-pop`, plus
`index.json`), rebuilt by `node scripts/build-templates.mjs` (`--check` in CI). motionary-mcp 2.3 lists them
(`list_templates`), returns one with its Scene v2 document and preview (`get_template`) and exports a scene, project or
template as standalone files (`export_scene`) — see [docs/mcp.md](./mcp.md).

## Not in 14.8

- A template gallery on the docs site and a shared tenant template directory behind MCP Gateway authorization
  (roadmap stage IV) — planned with 15.5 team projects.
- Applying `manifest.tokens` to the host theme on install.
