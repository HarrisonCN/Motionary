# Supply chain (16.9)

What you can verify about a Motionary release, and what is not in place yet.

| | Status |
|---|---|
| Runtime dependencies | **None.** `dependencies` is empty in every release; CI fails if one is added. |
| CDN pinning + SRI | Pin the exact version and add `integrity` — [cdn-sri.md](./cdn-sri.md) has this version's sha384 hashes, generated from the release build. |
| npm lockfile integrity | `npm ci` checks the tarball's sha512 recorded in `package-lock.json`. |
| npm provenance | **Not yet for published versions.** Up to and including the 17.0 release train, releases are published from the maintainer's machine with an npm token, which cannot produce a provenance statement (npm only signs provenance inside a supported CI, e.g. GitHub Actions with OIDC). [`publish.yml`](../.github/workflows/publish.yml) publishes with `npm publish --provenance` from GitHub Actions; it needs npm trusted publishing (or an `NPM_TOKEN` secret) to be configured for `motionary` and `use-scroll-animate` by the maintainer before it can run. |
| OpenSSF Scorecard | [`scorecard.yml`](../.github/workflows/scorecard.yml) runs on every push to `main` and weekly; results: <https://scorecard.dev/viewer/?uri=github.com/HarrisonCN/Motionary>. |
| Source maps | Not in the npm tarball; in the tagged git tree, and from 16.3 attached to each GitHub release as `motionary-X.Y.Z-sourcemaps.tgz` ([source-maps.md](./source-maps.md)). |
| Release tarball | Each GitHub release has the `npm pack` tarball of its tag attached by [`release.yml`](../.github/workflows/release.yml). |

## Checking a release yourself

```bash
npm view motionary@<version> dist.integrity     # sha512 of the published tarball
npm audit signatures                           # registry signatures (+ provenance once published from CI)
curl -sL https://cdn.jsdelivr.net/npm/motionary@<version>/dist/index.umd.js | openssl dgst -sha384 -binary | openssl base64 -A
```
